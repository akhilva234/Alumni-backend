import * as adminService from "../services/admin.services.js";

// ─── Stats ────────────────────────────────────────────────────────────────────

export async function getDashboardStats(req, res) {
    try {
        const caller = { userId: req.user.id, role: req.user.role };
        const stats = await adminService.getDashboardStats(caller);
        res.json(stats);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch stats", error: err.message });
    }
}

// ─── Alumni ───────────────────────────────────────────────────────────────────

export async function getAlumni(req, res) {
    try {
        const { search = "", dept = "" } = req.query;
        const caller = { userId: req.user.id, role: req.user.role };
        const alumni = await adminService.getAllAlumni({ search, dept }, caller);
        res.json(alumni);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch alumni", error: err.message });
    }
}

// ─── Requests ─────────────────────────────────────────────────────────────────

export async function getPendingRequests(req, res) {
    try {
        const caller = { userId: req.user.id, role: req.user.role };
        const requests = await adminService.getPendingRequests(caller);
        res.json(requests);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch requests", error: err.message });
    }
}

export async function updateApprovalStatus(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({ message: "status is required in body" });
        }

        const updated = await adminService.updateUserApprovalStatus(userId, status);
        res.json({ message: `User ${status.toLowerCase()} successfully`, user: updated });
    } catch (err) {
        res.status(500).json({ message: "Failed to update status", error: err.message });
    }
}

// ─── Faculty ──────────────────────────────────────────────────────────────────

export async function getFaculty(req, res) {
    try {
        const { search = "" } = req.query;
        const faculty = await adminService.getAllFaculty({ search });
        res.json(faculty);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch faculty", error: err.message });
    }
}

export async function createFaculty(req, res) {
    try {
        const faculty = await adminService.createFaculty(req.body);
        res.status(201).json({ message: "Faculty created successfully", faculty });
    } catch (err) {
        res.status(400).json({ message: "Failed to create faculty", error: err.message });
    }
}

export async function updateFaculty(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const faculty = await adminService.updateFaculty(userId, req.body);
        res.json({ message: "Faculty updated successfully", faculty });
    } catch (err) {
        res.status(500).json({ message: "Failed to update faculty", error: err.message });
    }
}

export async function deleteFaculty(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        await adminService.deleteFaculty(userId);
        res.json({ message: "Faculty deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete faculty", error: err.message });
    }
}


// ─── Principal ────────────────────────────────────────────────────────────────

export async function getPrincipals(req, res) {
    try {
        const principals = await adminService.getAllPrincipals();
        res.json(principals);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch principals", error: err.message });
    }
}

export async function createPrincipal(req, res) {
    try {
        const principal = await adminService.createPrincipal(req.body);
        res.status(201).json({ message: "Principal created successfully", principal });
    } catch (err) {
        res.status(400).json({ message: "Failed to create principal", error: err.message });
    }
}

export async function updatePrincipal(req, res) {
    try {
        const userId = parseInt(req.params.userId);
        const principal = await adminService.updatePrincipal(userId, req.body);
        res.json({ message: "Principal updated successfully", principal });
    } catch (err) {
        res.status(500).json({ message: "Failed to update principal", error: err.message });
    }
}

// ─── Events ───────────────────────────────────────────────────────────────────

export async function getEvents(req, res) {
    try {
        const caller = { userId: req.user.id, role: req.user.role };
        const events = await adminService.getAllEvents(caller);
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch events", error: err.message });
    }
}

export async function createEvent(req, res) {
    try {
        const adminId = req.user.id;
        const event = await adminService.createEvent(adminId, req.body);
        res.status(201).json({ message: "Event created successfully", event });
    } catch (err) {
        res.status(400).json({ message: "Failed to create event", error: err.message });
    }
}

export async function updateEvent(req, res) {
    try {
        const eventId = parseInt(req.params.eventId);
        const caller = { userId: req.user.id, role: req.user.role };
        const event = await adminService.updateEvent(eventId, req.body, caller);
        res.json({ message: "Event updated successfully", event });
    } catch (err) {
        const status = err.message.includes("only edit") ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
}

export async function deleteEvent(req, res) {
    try {
        const eventId = parseInt(req.params.eventId);
        const caller = { userId: req.user.id, role: req.user.role };
        await adminService.deleteEvent(eventId, caller);
        res.json({ message: "Event deleted successfully" });
    } catch (err) {
        const status = err.message.includes("only delete") ? 403 : 500;
        res.status(status).json({ message: err.message });
    }
}

export async function getEventById(req, res) {
    try {
        const eventId = parseInt(req.params.eventId);
        const event = await adminService.getEventById(eventId);
        if (!event) return res.status(404).json({ message: "Event not found" });
        res.json(event);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch event", error: err.message });
    }
}

// ─── Job Posts ────────────────────────────────────────────────────────────────

export async function getJobPosts(req, res) {
    try {
        const caller = { userId: req.user.id, role: req.user.role };
        const jobs = await adminService.getAllJobPosts(caller);
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch job posts", error: err.message });
    }
}

export async function createJobPost(req, res) {
    try {
        const adminId = req.user.id;
        const job = await adminService.createJobPost(adminId, req.body);
        res.status(201).json({ message: "Job post created successfully", job });
    } catch (err) {
        res.status(400).json({ message: "Failed to create job post", error: err.message });
    }
}

export async function deleteJobPost(req, res) {
    try {
        const postId = parseInt(req.params.postId);
        await adminService.deleteJobPost(postId);
        res.json({ message: "Job post deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete job post", error: err.message });
    }
}
