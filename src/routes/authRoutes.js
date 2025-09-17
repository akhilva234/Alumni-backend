import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import prisma from '../../prismaClient.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phone_number,
      gender,
      current_address,
      password,
      prn_number,
      graduation_year,
      degree_id,
      department_id,
      course_id,              
      current_position,
      company_name,
      industry_id,
      work_email,
      linkedin_profile,
      key_skills,
      date_of_birth
    } = req.body

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name: firstname,
          last_name: lastname,
          email,
          phone_number,
          gender,
          current_address,
          password: hashedPassword,
          department_id,
          course_id,
          date_of_birth: new Date(date_of_birth) 
        }
      })

      await tx.academic_Detail.create({     
        data: {
          user_id: user.user_id,
          prn_number,
          graduation_year,
          degree_id,
          department_id
        }
      })

      return user
    })

    res.status(201).json({ message: "User registered successfully", user: result })
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message })
  }
})

export default router
