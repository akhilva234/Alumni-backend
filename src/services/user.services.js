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

       if (!userDetails) throw new Error("!USER")
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
      phone_number:true,
      gender:true,
      date_of_birth:true,
      location:true,
      current_address:true,
      marital_status:true,

        academicDetails:{
          select:{
            graduation_year:true,
            degree:{
               select:{degree_name:true} 
            },
            department:{select:{
              department_name:true
            }}
           
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
            work_email:true,
            instagram:true,
            key_skills:true,
            linkedin_profile:true,
            industry:{
          select:{industry_name:true}
        }
          }
        },
        externalEducation:{
          select:{
            course_name:true,
            college_name:true,
            start_year:true,
            end_year:true,
            degree:{
              select:{degree_name:true}
            }
          }
        }
      }   
  })

  if(!userDetails) throw new Error("!USER")

         // Helper to find UG/PG in academicDetails or externalEducation
    const mapDegree = (degreeType) => {
      // Check academicDetails first
      const myCollege = userDetails.academicDetails.find(
        (d) => d.degree?.degree_name?.toLowerCase().includes(degreeType.toLowerCase())
      );
      if (myCollege) {
        return {
          course: userDetails.course?.course_name || "",
          college:"MES COLLEGE MARAMPALLY",
          year: myCollege.graduation_year || "",
          fromMyCollege: true,
        };
      }

      // Check externalEducation
      const otherCollege = userDetails.externalEducation?.find(
        (d) => d.degree?.degree_name?.toLowerCase().includes(degreeType.toLowerCase())
      );
      if (otherCollege) {
        return {
          course: otherCollege.course_name || "",
          college: otherCollege.college_name || "",
          year: otherCollege.start_year && otherCollege.end_year
            ? `${otherCollege.start_year}-${otherCollege.end_year}`
            : "",
          fromMyCollege: false,
        };
      }

      return null;
    };

    const undergraduate = mapDegree("undergraduate");
    const postgraduate = mapDegree("postgraduate");

    return {
      ...userDetails,
      undergraduate,
      postgraduate,
      externalEducation: undefined // optional: remove original array
    };

    

  }catch(err){
    throw err
  }
  
}
