import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { getCoursesControl } from '../controller/course.controller.js'

const router = express.Router()

router.get('/courselist',authenticate,getCoursesControl)

export default router