import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import prisma from '../../prismaClient.js'
import { register,login } from '../controller/auth.controller.js'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';

const router = express.Router()

//register controller call
router.post('/register',register)

//login controller call
router.post('/login',login)

export default router
