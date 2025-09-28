import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { MiniProfile } from '../controller/user.controller.js';

const router = express.Router()

//get mini profile
router.get('/miniprofile',authenticate,authorizeRoles('ALUMNI','ADMIN','FACULTY'),MiniProfile)

export default router
