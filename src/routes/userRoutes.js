import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { MiniProfile } from '../controller/user.controller.js';
import { FullProfile, UpdateProfile } from '../controller/user.controller.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../validations/user.schema.js';

const router = express.Router()

//get mini profile
router.get('/miniprofile', authenticate, authorizeRoles('ALUMNI', 'ADMIN', 'FACULTY','RETD_FACULTY','PRINCIPAL','EX_PRINCIPAL'), MiniProfile)

//get full profile
router.get('/fullprofile', authenticate, authorizeRoles('ALUMNI', 'FACULTY', 'RETD_FACULTY', 'ADMIN','PRINCIPAL','EX_PRINCIPAL'), FullProfile)

//update profile
router.put('/updateprofile', authenticate, authorizeRoles('ALUMNI', 'FACULTY', 'RETD_FACULTY', 'ADMIN','PRINCIPAL','EX_PRINCIPAL'), validate(updateProfileSchema), UpdateProfile)



export default router
