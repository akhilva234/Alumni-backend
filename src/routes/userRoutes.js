import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { MiniProfile } from '../controller/user.controller.js';
import { FullProfile } from '../controller/user.controller.js';

const router = express.Router()

//get mini profile
router.get('/miniprofile',authenticate,authorizeRoles('ALUMNI','ADMIN','FACULTY'),MiniProfile)

//get full profile
router.get('/fullprofile',authenticate,authorizeRoles('ALUMNI','FACULTY','RETD_FACULTY','ADMIN'),FullProfile)



export default router
