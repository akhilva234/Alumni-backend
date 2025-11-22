
import prisma from "../../prismaClient.js"
import bcrypt from 'bcryptjs'

export async function getMiniProfile(UserId){
try{

     const userDetails = await prisma.user.findUnique({
  where: { user_id: UserId },
  select: {
    first_name: true,
    last_name: true,
    email: true,
    role: true,

    academicDetails: {
      select: {
        graduation_year: true,
        adm_year: true,

        course: {
          select: {
            course_name: true,

            department: {
              select: {
                department_name: true
              }
            }
          }
        }
      }
    }
  }
});


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
            adm_year:true,

             course: {
          select: {
            course_name: true,

            department: {
              select: {
                department_name: true
              }
            },
            degree:{
                select:{degree_name:true}
              }
          }
        }
            
          },
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
          select:{industry_name:true,industry_id:true}
        }
          }
        },
        externalEducation:{
          select:{
            course_name:true,
            college_name:true,
            start_year:true,
            degree:{
              select:{degree_name:true}
            }
          }
        }
      }   
  })

  if(!userDetails) throw new Error("!USER")

      const MES_COLLEGE = "MES COLLEGE MARAMPALLY";

         // Helper to find UG/PG in academicDetails or externalEducation
    const mapDegree = (degreeType) => {
      // Check academicDetails first

       const myCollegeDegree = userDetails.academicDetails.find(
        (d) =>
          d.course?.degree?.degree_name?.toLowerCase().includes(degreeType.toLowerCase())
      );

      if (myCollegeDegree) {
        return {
          course: myCollegeDegree.course?.course_name || "",
          college: MES_COLLEGE,
          year: myCollegeDegree.adm_year || "",
          fromMyCollege: true,
        };
      }

      // Check externalEducation if not found in academicDetails
      const extDegree = userDetails.externalEducation?.find(
        (d) =>
          degree?.degree_name?.toLowerCase().includes(degreeType.toLowerCase())
      );

      if (extDegree) {
        const isMyCollege =
          extDegree.college_name?.toUpperCase() === MES_COLLEGE;
        return {
          course: extDegree.course_name || "",
          college: extDegree.college_name || "",
          year:extDegree.start_year||"",
          fromMyCollege: isMyCollege,
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
      externalEducation: undefined 
    };

    

  }catch(err){
    throw err
  }
  
}

export async function updateProfile(userId,userData){

//   try{
//     const result=await prisma.$transaction(async (tx)=>{
   

//      const updateData = {};

//     if (userData.first_name) updateData.first_name = userData.first_name;
//     if (userData.last_name) updateData.last_name = userData.last_name;
//     if (userData.email) updateData.email = userData.email;
//     if (userData.phone_number) updateData.phone_number = userData.phone_number;
//     if (userData.gender) updateData.gender = userData.gender;
//     if (userData.location) updateData.location = userData.location;
//     if (userData.current_address) updateData.current_address = userData.current_address;
//     if (userData.marital_status) updateData.marital_status = userData.marital_status;
//     if (userData.date_of_birth) updateData.date_of_birth = new Date(userData.date_of_birth);

//     if (userData.password) {
//       // hash password before updating!
//       const hashedPassword = await hash(userData.password,10); 
//       updateData.password = hashedPassword;
//     }

//     //updating basic user details
//     const updateUser=await tx.user.update({
//       where:{
//         user_id:userId
//       },
//       data:updateData,
//     });

//     //updating professional details
//     const prof=userData.professionalDetails?.[0]||{};
//     if(prof){
//       const existingProf=await tx.professional_Detail.findFirst({
//         where:{user_id:userId},
//       });

//       if(existingProf){
//         await tx.professional_Detail.update({
//           where:{
//             professional_id:existingProf.professional_id
//           },
//           data:{
//             current_position:prof.current_position,
//             company_name:prof.company_name,
//             experience:prof.experience,
//             work_email:prof.work_email,
//             linkedin_profile:prof.linkedin_profile,
//             instagram:prof.instagram,
//             key_skills:prof.key_skills,
//             industry_id:prof.industry_id,
//           },
//         });
//       }else{
//         await tx.professional_Detail.create({
//           data:{
//             user_id:userId,
//             current_position:prof.current_position,
//             company_name:prof.company_name,
//             experience:prof.experience,
//             work_email:prof.work_email,
//             linkedin_profile:prof.linkedin_profile,
//             instagram:prof.instagram,
//             key_skills:prof.key_skills,
//             industry_id:prof.industry_id,  
//           },
//         });
//       }
//     }

//   async function getDegreeId(tx, degreeName) {
//   const degree = await tx.degree.findUnique({
//     where: { degree_name: degreeName },
//   });

//   if (!degree) {
//     throw new Error(`Degree "${degreeName}" not found`);
//   }

//   return degree.degree_id;
// }


//     //updating education details
//     if(userData.undergraduate){
//        const collegeName = userData.undergraduate.college || "";
//        const degree = await getDegree(tx, "UnderGraduate");
//        const academicData={
//         user_id:userId,
//         adm_year:userData.undergraduate.year,
//         degree:{connect:{degree_id:degree}},
//        };

//       if(collegeName.toLowerCase().includes("mes marampally")){
//         await tx.academic_Detail.create({
//           data:academicData,
//         });
//        }else{
//         await tx.external_Education.create({

//         });
//        }

//     }


//     });
//   }catch(err){

//   }

}
