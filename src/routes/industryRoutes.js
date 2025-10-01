import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { getIndustryControl } from '../controller/industry.controller.js';

const router = express.Router()

router.get('/industrylist',authenticate,getIndustryControl)

export default router