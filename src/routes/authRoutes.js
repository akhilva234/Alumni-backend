import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import prisma from '../../prismaClient.js'
import { register,login } from '../controller/auth.controller.js'

const router = express.Router()

router.post('/register',register)

router.post('/login',login)

export default router
