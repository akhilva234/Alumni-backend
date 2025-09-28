import prisma from "../../prismaClient.js"

export async function getMiniProfile(UserId){
try{

     const userDetails = await prisma.user.findUnique({
        where:{user_id:UserId},
        select:{
             first_name: true,
            last_name: true,
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