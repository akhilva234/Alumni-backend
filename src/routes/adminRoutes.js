import express from "express";
import { authenticate, authorizeRoles } from "../middleware/authMiddleWare.js";
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
} from "../controller/admin.controller.js";

const router = express.Router();

// All admin routes require at minimum authentication
router.use(authenticate);

// ─── Stats (admin only) ───────────────────────────────────────────────────────
router.get("/stats", authorizeRoles("ADMIN"), getDashboardStats);

// ─── Alumni — admin + faculty (faculty see own dept only) ─────────────────────
router.get("/alumni", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), getAlumni);

// ─── Requests — admin + faculty (faculty approve/reject their dept only) ──────
router.get("/requests", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), getPendingRequests);
router.patch("/requests/:userId/status", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), updateApprovalStatus);


// ─── Faculty ──────────────────────────────────────────────────────────────────
// GET: admin + faculty (both can view the list)
router.get("/faculty", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), getFaculty);
// Mutations: admin only
router.post("/faculty", authorizeRoles("ADMIN"), createFaculty);
router.put("/faculty/:userId", authorizeRoles("ADMIN"), updateFaculty);
router.delete("/faculty/:userId", authorizeRoles("ADMIN"), deleteFaculty);

// ─── Events — admin + faculty (faculty CRUD their own events only) ────────────
router.get("/events", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), getEvents);
router.post("/events", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), createEvent);
router.put("/events/:eventId", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), updateEvent);
router.delete("/events/:eventId", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), deleteEvent);

// ─── Job Posts — GET for faculty (dept alumni posts only), mutations admin only
router.get("/jobs", authorizeRoles("ADMIN", "FACULTY", "RETD_FACULTY"), getJobPosts);
router.post("/jobs", authorizeRoles("ADMIN"), createJobPost);
router.delete("/jobs/:postId", authorizeRoles("ADMIN"), deleteJobPost);

export default router;
