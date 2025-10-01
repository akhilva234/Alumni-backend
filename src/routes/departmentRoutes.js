import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { getDeptController} from '../controller/dept.controller.js';

const router = express.Router()

router.get('/deptdetails',authenticate,getDeptController)

export default router