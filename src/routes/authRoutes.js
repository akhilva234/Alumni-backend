import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import express from 'express'
import prisma from '../../prismaClient.js'

const router = express.Router()


router.post('/register',async(req,res)=>{
   try{

    const{firstname,lastname,email,phone_number,gender,current_address
        ,password,prn_number,graduation_year,degree_id,department_id,current_position,
        company_name,industry_id,work_email,linkedin_profile,key_skills} =req.body

     const hashedPassword= await bcrypt.hash(password,10)
     
     const result = await prisma.$transaction(async(tx)=>{

        const user = await tx.user.create({
            data:{
                firstname,
                lastname,
                email,
                phone_number,
                gender,
                current_address,
                password:hashedPassword
            }
        })

        await tx.academic_details.create({
            data:{
                prn_number,
                graduation_year,
                degree_id,
                department_id
            }
        })
        return user;

     })

     res.status(201).json({ message: "User registered successfully", user: result });


   }catch(err){
    res.status(500).json({message:"Registration failed",err})
   }
})

export default router