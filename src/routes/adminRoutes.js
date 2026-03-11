import express from "express";
import {
    getDashboardStats,
    getAlumni,
    getPendingRequests,
    updateApprovalStatus,
    getFaculty,
    createFaculty,
    updateFaculty,
    deleteFaculty,
    getEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    getJobPosts,
    createJobPost,
    deleteJobPost,
    getEventById,
    getPrincipals,
    createPrincipal,
    updatePrincipal,
} from "../controller/admin.controller.js";
import { authenticate, authorizeRoles } from "../middleware/authMiddleWare.js";
import { validate } from "../middleware/validate.js";
import {
    updateApprovalStatusSchema,
    createFacultySchema,
    updateFacultySchema,
    createEventSchema,
    updateEventSchema,
    createJobPostSchema,
    createPrincipalSchema,
    updatePrincipalSchema
} from "../validations/admin.schema.js";

const router = express.Router();

// All admin routes require at minimum authentication
router.use(authenticate);

// ─── Stats (admin + faculty) ──────────────────────────────────────────────────
router.get("/stats", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), getDashboardStats);

// ─── Alumni — admin + faculty (faculty see own dept only) ─────────────────────
router.get("/alumni", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), getAlumni);

// ─── Requests — admin + faculty (faculty approve/reject their dept only) ──────
router.get("/requests", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), getPendingRequests);
router.patch("/requests/:userId/status", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), validate(updateApprovalStatusSchema), updateApprovalStatus);


// ─── Faculty ──────────────────────────────────────────────────────────────────
// GET: admin + faculty (both can view the list)
router.get("/faculty", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), getFaculty);
// Mutations: admin only
router.post("/faculty", authorizeRoles("ADMIN","PRINCIPAL"), validate(createFacultySchema), createFaculty);
router.put("/faculty/:userId", authorizeRoles("ADMIN","PRINCIPAL"), validate(updateFacultySchema), updateFaculty);
router.delete("/faculty/:userId", authorizeRoles("ADMIN","PRINCIPAL"), deleteFaculty);

// ─── Principal ────────────────────────────────────────────────────────────────

// GET: admin can view the principals
router.get("/principal", authorizeRoles("ADMIN"), getPrincipals);
// Mutations: admin only
router.post("/principal", authorizeRoles("ADMIN"), validate(createPrincipalSchema), createPrincipal);
router.put("/principal/:userId", authorizeRoles("ADMIN"), validate(updatePrincipalSchema), updatePrincipal);

// ─── Events — admin + faculty (faculty CRUD their own events only) ────────────
router.get("/events", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY", "ALUMNI","PRINCIPAL","EX_PRINCIPAL"), getEvents);
router.get("/events/:eventId", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY", "ALUMNI","PRINCIPAL","EX_PRINCIPAL"), getEventById);
router.post("/events", authorizeRoles("ADMIN", "FACULTY"), validate(createEventSchema), createEvent);
router.put("/events/:eventId", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), validate(updateEventSchema), updateEvent);
router.delete("/events/:eventId", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), deleteEvent);

// ─── Job Posts — GET for faculty (dept alumni posts only), mutations admin , principal only
router.get("/jobs", authorizeRoles("ADMIN", "FACULTY","PRINCIPAL"), getJobPosts);
router.post("/jobs", authorizeRoles("ADMIN","FACULTY","PRINCIPAL"), validate(createJobPostSchema), createJobPost);
router.delete("/jobs/:postId", authorizeRoles("ADMIN","PRINCIPAL"), deleteJobPost);

export default router;
