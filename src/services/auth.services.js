import bcrypt from 'bcryptjs'
import prisma from '../../prismaClient.js'
import jwt from "jsonwebtoken";
import { ApprovedStatus } from '@prisma/client';

export async function register(UserData){

    try{
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
    } = UserData

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        throw new Error("Email already registered");
    }


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
          department:{
            connect:{department_id:department_id}
          },
          course:{
            connect:{course_id:course_id}
          },
          date_of_birth: new Date(date_of_birth) 
        }
      })

      await tx.academic_Detail.create({     
        data: {
          user_id: user.user_id,
          prn_number,
          graduation_year,
          degree_id:degree_id,
          department_id:department_id
        }
      })

      await tx.professional_Detail.create({
        data:{
          user_id:user.user_id,
          current_position,
          company_name,
          industry_id,
          work_email,
          linkedin_profile,
          key_skills
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
