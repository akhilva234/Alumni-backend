import prisma from "../../prismaClient.js"

export async function getMiniProfile(UserId){
try{

     const userDetails = await prisma.user.findUnique({
        where:{user_id:UserId},
        select:{
             first_name: true,
            last_name: true,
            email:true,
            role:true,
            academicDetails:{

                select:{graduation_year: true},
            },
            course: {
                select: { course_name: true },
                },
              department: {
        select: { department_name: true },
      },   
    },
     })
     return userDetails
}catch(err){
    throw err
}
}

export async function getFullProfile(userId){

  try{

      const userDetails = await prisma.user.findUnique({
    where:{user_id:userId},
    select:{
      first_name:true,
      last_name:true,
      user_photo:true,
      email:true,

        academicDetails:{
          select:{
            graduation_year:true,
            college_name:true,
            degree:{
               select:{degree_name:true} 
            }
           
          },
        },
        course:{
          select:{course_name:true}
        },
        professionalDetails:{
          select:{
            current_position:true,
            company_name:true,
            experience:true,
            industry:{
          select:{industry_name:true}
        }
          }
        },
      }   
  })

    return userDetails

  }catch(err){
    throw err
  }
  
}
