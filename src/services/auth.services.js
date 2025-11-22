import bcrypt from 'bcryptjs'
import prisma from '../../prismaClient.js'
import jwt from "jsonwebtoken";
import { ApprovedStatus } from '@prisma/client';

export async function register(UserData){

    try{
        const {
      firstName,
      lastName,
      email,
      phone,
      password,
      gender,
      address,
      prn,
      adm_year,
      graduationYear,
      degree,
      department,
      course,              
      position,
      company,
      industry,
      workEmail,
      linkedin,
      skills,
      dob,
      martialStatus
    } = UserData

    if (!password) {
      throw new Error("Password is required");
    }
    if (!email) {
      throw new Error("Email is required");
    }
    if (!phone) {
      throw new Error("Phone is required");
    }

    const existingPrn = await prisma.academic_Detail.findUnique({where:{prn_number:prn}})
    if(existingPrn){
      throw new Error("PRN already registered");
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already registered");
    }


      const hashedPassword = await bcrypt.hash(password, 10)

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          password:hashedPassword,
          phone_number:phone,
          gender,
          current_address:address,
          marital_status:martialStatus,
          date_of_birth: new Date(dob) 
        }
      })

      await tx.academic_Detail.create({     
        data: {
          user: {
            connect: { user_id: user.user_id }
          },
          prn_number:prn,
          adm_year:Number(adm_year),
          graduation_year:Number(graduationYear),
          course:{
            connect:{course_id:Number(course)}
          },
        }
      })

      await tx.professional_Detail.create({
        data:{
          user_id:user.user_id,
          current_position:position,
          company_name:company,
          industry_id:Number(industry),
          work_email:workEmail,
          linkedin_profile:linkedin,
          key_skills:skills
        }
      })

      return user
    })

    return {
        user: {
        id: result.user_id,
        firstname: result.first_name,
        lastname: result.last_name,
        email: result.email,
        phone_number: result.phone_number
      }
    };

    }catch(err){
       throw new Error(err.message || "Registration failed");
    }

}

export async function login(loginData) {
    const {email,password}=loginData

    try{
        const user= await prisma.user.findUnique({
            where:{email},
        })
        

        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

        if (user.approved_status === "PENDING") {
          throw new Error("USER_PENDING");
        }


        const validPassword = bcrypt.compareSync(password, user.password);
        if (!validPassword) {
          throw new Error("INVALID_PASSWORD");
        }

        const token = jwt.sign({id:user.user_id,role:user.role},process.env.JWT_SECRET_KEY,{expiresIn:"1h"})

        return {token,user}
        
    }catch(err){
      throw err;

    }
    
}
