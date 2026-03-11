import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import prisma from '../../prismaClient.js'
import { register,login,logout } from '../controller/auth.controller.js'
import { authenticate, authorizeRoles } from '../middleware/authMiddleWare.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validations/auth.schema.js';

const router = express.Router()

//register controller call
router.post('/register', authLimiter, validate(registerSchema), register)

//login controller call
router.post('/login', authLimiter, validate(loginSchema), login)

//logout controller call
router.post('/logout', logout)

export default router
