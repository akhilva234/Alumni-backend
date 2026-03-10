import prisma from "../../prismaClient.js";
import bcrypt from "bcryptjs";

// ─── Faculty CRUD (admin-managed) ────────────────────────────────────────────

export async function createFaculty(data) {
    const {
        first_name,
        last_name,
        email,
        phone_number,
        date_of_birth,
        role = "FACULTY",
        password,
        department_id,   // required for faculty profile
    } = data;

    if (!first_name || !last_name || !email || !password || !phone_number || !date_of_birth) {
        throw new Error(
            "first_name, last_name, email, phone_number, date_of_birth and password are required"
        );
    }

    const validRoles = ["FACULTY", "RETD_FACULTY"];
    if (!validRoles.includes(role)) {
        throw new Error(`role must be one of: ${validRoles.join(", ")}`);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("Email already registered");

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction: create User + Faculty_Profile atomically
    return prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
            data: {
                first_name,
                last_name,
                email,
                phone_number,
                date_of_birth: new Date(date_of_birth),
                password: hashedPassword,
                role,
                approved_status: "APPROVED",
            },
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                role: true,
                approved_status: true,
            },
        });

        // Create Faculty_Profile if department provided
        let facultyProfile = null;
        if (department_id) {
            facultyProfile = await tx.faculty_Profile.create({
                data: {
                    user_id: user.user_id,
                    department_id: Number(department_id),
                },
                include: { department: { select: { department_name: true } } },
            });
        }

        return { ...user, facultyProfile };
    });
}

export async function updateFaculty(userId, data) {
    const { first_name, last_name, email, phone_number, role, department_id } = data;

    const validRoles = ["FACULTY", "RETD_FACULTY"];
    if (role && !validRoles.includes(role)) {
        throw new Error(`role must be one of: ${validRoles.join(", ")}`);
    }

    return prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
            where: { user_id: userId },
            data: {
                ...(first_name && { first_name }),
                ...(last_name && { last_name }),
                ...(email && { email }),
                ...(phone_number && { phone_number }),
                ...(role && { role }),
            },
            select: {
                user_id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone_number: true,
                role: true,
            },
        });

        // Upsert Faculty_Profile if department_id provided
        if (department_id) {
            await tx.faculty_Profile.upsert({
                where: { user_id: userId },
                create: { user_id: userId, department_id: Number(department_id) },
                update: { department_id: Number(department_id) },
            });
        }

        return user;
    });
}

export async function deleteFaculty(userId) {
    // Safety: only delete if user is actually faculty
    const user = await prisma.user.findUnique({ where: { user_id: userId } });
    if (!user || !["FACULTY", "RETD_FACULTY"].includes(user.role)) {
        throw new Error("Faculty member not found");
    }
    return prisma.user.delete({ where: { user_id: userId } });
}

// ─── Department helper for faculty ──────────────────────────────────────────
// Reads directly from Faculty_Profile (not academicDetails).
// Returns [department_id] or null (no profile = see all).
export async function getFacultyDepartmentIds(facultyUserId) {
    const profile = await prisma.faculty_Profile.findUnique({
        where: { user_id: facultyUserId },
        select: { department_id: true },
    });
    if (!profile) return null;   // no profile → fallback: show all
    return [profile.department_id];
}

// ─── Dashboard Stats ──────────────────────────────────────────────────────────


export async function getDashboardStats(caller = {}) {
    const isFaculty = caller.role === "FACULTY" || caller.role === "RETD_FACULTY";
    const isAdmin = caller.role === "ADMIN";
    const now = new Date();

    let facultyDeptIds = null;
    if (isFaculty) {
        facultyDeptIds = await getFacultyDepartmentIds(caller.userId);
    }

    const alumniWhere = {
        role: "ALUMNI",
        approved_status: "APPROVED",
        ...(facultyDeptIds ? {
            academicDetails: {
                some: { course: { department_id: { in: facultyDeptIds } } }
            }
        } : {})
    };

    const jobWhere = {
        post_type: "JOB",
        ...(facultyDeptIds ? {
            user: {
                academicDetails: {
                    some: { course: { department_id: { in: facultyDeptIds } } }
                }
            }
        } : {})
    };

    const eventWhere = {
        event_date: { gte: now },
        ...(isFaculty ? { organizer_id: caller.userId } : {})
    };

    const [totalAlumni, upcomingEvents, activeJobs, totalFaculty] =
        await Promise.all([
            // Approved alumni count (optionally scoped)
            prisma.user.count({ where: alumniWhere }),
            // Events organized count (optionally scoped)
            prisma.event.count({ where: eventWhere }),
            // Job posts count (optionally scoped)
            prisma.post.count({ where: jobWhere }),
            // Total faculty count (global)
            prisma.user.count({
                where: { role: { in: ["FACULTY", "RETD_FACULTY"] } },
            }),
        ]);

    // Most recent job post (scoped)
    const recentJob = await prisma.post.findFirst({
        where: jobWhere,
        orderBy: { created_at: "desc" },
        include: {
            user: { select: { first_name: true, last_name: true, role: true } },
        },
    });

    // Most recent upcoming event (scoped)
    const recentEvent = await prisma.event.findFirst({
        where: eventWhere,
        orderBy: { event_date: "asc" },
    });

    return { totalAlumni, upcomingEvents, activeJobs, totalFaculty, recentJob, recentEvent };
}

// ─── Alumni ───────────────────────────────────────────────────────────────────
// caller: { userId, role } — when role is FACULTY/RETD_FACULTY, results are
// scoped to the departments the faculty member belongs to.
export async function getAllAlumni({ search = "", dept = "" } = {}, caller = {}) {
    // Determine department scope
    let deptIds = null; // null = no filter
    if (caller.role === "FACULTY" || caller.role === "RETD_FACULTY") {
        deptIds = await getFacultyDepartmentIds(caller.userId);
        // deptIds === null means no academic mapping → show all
    }

    const alumni = await prisma.user.findMany({
        where: {
            role: "ALUMNI",
            approved_status: "APPROVED",
            ...(search
                ? {
                    OR: [
                        { first_name: { contains: search, mode: "insensitive" } },
                        { last_name: { contains: search, mode: "insensitive" } },
                        { email: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
            // Scope to faculty's departments via academicDetails
            ...(deptIds
                ? {
                    academicDetails: {
                        some: { course: { department_id: { in: deptIds } } },
                    },
                }
                : {}),
        },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            user_photo: true,
            academicDetails: {
                select: {
                    graduation_year: true,
                    adm_year: true,
                    course: {
                        select: {
                            course_name: true,
                            department: { select: { department_name: true } },
                        },
                    },
                },
            },
            professionalDetails: {
                select: { company_name: true, current_position: true },
            },
        },
        orderBy: { first_name: "asc" },
    });

    // Optional extra department text-filter from query param
    if (dept) {
        return alumni.filter((a) =>
            a.academicDetails.some((ad) =>
                ad.course?.department?.department_name
                    ?.toLowerCase()
                    .includes(dept.toLowerCase())
            )
        );
    }

    return alumni;
}

// ─── Registration Requests (Pending) ─────────────────────────────────────────
// caller: { userId, role } — when role is FACULTY/RETD_FACULTY, only returns
// pending requests from the faculty's own department(s).
export async function getPendingRequests(caller = {}) {
    // Determine department scope
    let deptIds = null;
    if (caller.role === "FACULTY" || caller.role === "RETD_FACULTY") {
        deptIds = await getFacultyDepartmentIds(caller.userId);
    }

    return prisma.user.findMany({
        where: {
            role: "ALUMNI",
            approved_status: "PENDING",
            // Scope to faculty's departments if applicable
            ...(deptIds
                ? {
                    academicDetails: {
                        some: { course: { department_id: { in: deptIds } } },
                    },
                }
                : {}),
        },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            user_photo: true,
            approved_status: true,
            academicDetails: {
                select: {
                    graduation_year: true,
                    adm_year: true,
                    prn_number: true,
                    degree_certificate: true,
                    course: {
                        select: {
                            course_name: true,
                            degree: { select: { degree_name: true } },
                            department: { select: { department_name: true } },
                        },
                    },
                },
            },
        },
        orderBy: { user_id: "desc" },
    });
}

export async function updateUserApprovalStatus(userId, status) {
    const validStatuses = ["APPROVED", "REJECTED", "PENDING"];
    if (!validStatuses.includes(status)) {
        throw new Error(`Invalid status: ${status}`);
    }

    return prisma.user.update({
        where: { user_id: userId },
        data: { approved_status: status },
        select: { user_id: true, first_name: true, last_name: true, approved_status: true },
    });
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export async function getAllFaculty({ search = "" } = {}) {
    return prisma.user.findMany({
        where: {
            role: { in: ["FACULTY", "RETD_FACULTY"] },
            ...(search
                ? {
                    OR: [
                        { first_name: { contains: search, mode: "insensitive" } },
                        { last_name: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        select: {
            user_id: true,
            first_name: true,
            last_name: true,
            email: true,
            user_photo: true,
            phone_number: true,
            role: true,
            // Use Faculty_Profile for department info (not academicDetails)
            facultyProfile: {
                select: {
                    department_id: true,
                    joined_date: true,
                    department: { select: { department_name: true } },
                },
            },
        },
        orderBy: { first_name: "asc" },
    });
}

// ─── Events ───────────────────────────────────────────────────────────────────
// caller: { userId, role }
// FACULTY   → only events they organized
// ADMIN     → all events
export async function getAllEvents(caller = {}) {
    const isFaculty = caller.role === "FACULTY" || caller.role === "RETD_FACULTY";

    return prisma.event.findMany({
        where: {
            ...(isFaculty ? { organizer_id: caller.userId } : {}),
        },
        orderBy: { event_date: "asc" },
        include: {
            organizer: {
                select: { first_name: true, last_name: true },
            },
            _count: { select: { donations: true } },
        },
    });
}

export async function createEvent(organizerId, data) {
    const { title, description, event_date, event_time, location, image_url } = data;

    if (!title || !description || !event_date) {
        throw new Error("title, description, and event_date are required");
    }

    return prisma.event.create({
        data: {
            title,
            description,
            image_url: image_url || null,
            event_date: new Date(event_date),
            event_time: event_time || null,
            location: location || null,
            organizer_id: organizerId,
        },
    });
}

export async function updateEvent(eventId, data, caller = {}) {
    const { title, description, event_date, event_time, location, image_url } = data;
    const isFaculty = caller.role === "FACULTY" || caller.role === "RETD_FACULTY";

    // Faculty can only edit events they organized
    if (isFaculty) {
        const event = await prisma.event.findUnique({ where: { event_id: eventId } });
        if (!event || event.organizer_id !== caller.userId) {
            throw new Error("You can only edit events you created");
        }
    }

    return prisma.event.update({
        where: { event_id: eventId },
        data: {
            ...(title && { title }),
            ...(description && { description }),
            ...(image_url !== undefined && { image_url }),
            ...(event_date && { event_date: new Date(event_date) }),
            ...(event_time !== undefined && { event_time }),
            ...(location !== undefined && { location }),
        },
    });
}

export async function deleteEvent(eventId, caller = {}) {
    const isFaculty = caller.role === "FACULTY" || caller.role === "RETD_FACULTY";

    // Faculty can only delete events they organized
    if (isFaculty) {
        const event = await prisma.event.findUnique({ where: { event_id: eventId } });
        if (!event || event.organizer_id !== caller.userId) {
            throw new Error("You can only delete events you created");
        }
    }

    return prisma.event.delete({ where: { event_id: eventId } });
}

// ─── Job Posts ────────────────────────────────────────────────────────────────
// caller: { userId, role }
// FACULTY   → only JOB posts created by alumni in their department
// ADMIN     → all JOB posts
export async function getAllJobPosts(caller = {}) {
    const isFaculty = caller.role === "FACULTY" || caller.role === "RETD_FACULTY";

    // For faculty: resolve their department alumni user_ids first
    let alumniUserIds = undefined;
    if (isFaculty) {
        const deptIds = await getFacultyDepartmentIds(caller.userId);
        if (deptIds) {
            // Get alumni in this department
            const deptAlumni = await prisma.user.findMany({
                where: {
                    role: "ALUMNI",
                    approved_status: "APPROVED",
                    academicDetails: {
                        some: { course: { department_id: { in: deptIds } } },
                    },
                },
                select: { user_id: true },
            });
            alumniUserIds = deptAlumni.map((a) => a.user_id);
        }
    }

    return prisma.post.findMany({
        where: {
            post_type: "JOB",
            // Faculty: only posts by their dept alumni (or all if no dept mapping)
            ...(alumniUserIds !== undefined
                ? { user_id: { in: alumniUserIds } }
                : {}),
        },
        orderBy: { created_at: "desc" },
        include: {
            user: { select: { first_name: true, last_name: true, role: true } },
            _count: { select: { likes: true, comments: true } },
        },
    });
}

export async function createJobPost(userId, data) {
    const { content, image_url } = data;

    if (!content) throw new Error("content is required");

    return prisma.post.create({
        data: {
            user_id: userId,
            content,
            image_url: image_url || null,
            post_type: "JOB",
        },
        include: {
            user: { select: { first_name: true, last_name: true, role: true } },
        },
    });
}

export async function deleteJobPost(postId) {
    const post = await prisma.post.findUnique({ where: { post_id: postId } });
    if (!post || post.post_type !== "JOB") {
        throw new Error("Job post not found");
    }
    return prisma.post.delete({ where: { post_id: postId } });
}

export async function getEventById(eventId) {
    return prisma.event.findUnique({
        where: { event_id: eventId },
        include: {
            organizer: {
                select: { first_name: true, last_name: true },
            },
            _count: { select: { donations: true } },
        },
    });
}
