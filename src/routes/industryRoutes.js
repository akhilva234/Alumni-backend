import express from 'express'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { getIndustryControl } from '../controller/industry.controller.js';

const router = express.Router()

router.get('/industrylist',getIndustryControl)

export default router