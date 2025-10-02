import express, { Router } from 'express'
import { authenticate,authorizeRoles } from '../middleware/authMiddleWare.js'
import { getDegreeContol } from '../controller/degree.controller.js'

const router = express.Router()

router.get('/degreelist',getDegreeContol)

export default router