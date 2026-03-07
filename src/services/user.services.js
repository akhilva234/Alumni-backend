
import prisma from "../../prismaClient.js"
import bcrypt from 'bcryptjs'

export async function getMiniProfile(UserId) {
  try {

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
  } catch (err) {
    throw err
  }
}

export async function getFullProfile(userId) {

  try {

    const userDetails = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        first_name: true,
        last_name: true,
        user_photo: true,
        email: true,
        phone_number: true,
        gender: true,
        date_of_birth: true,
        location: true,
        current_address: true,
        marital_status: true,

        academicDetails: {
          select: {
            graduation_year: true,
            adm_year: true,
            prn_number: true,

            course: {
              select: {
                course_id: true,
                course_name: true,
                department_id: true,
                degree_id: true,

                department: {
                  select: {
                    department_id: true,
                    department_name: true
                  }
                },
                degree: {
                  select: { degree_id: true, degree_name: true }
                }
              }
            }

          },
        },
        professionalDetails: {
          select: {
            current_position: true,
            company_name: true,
            experience: true,
            work_email: true,
            instagram: true,
            key_skills: true,
            linkedin_profile: true,
            industry: {
              select: { industry_name: true, industry_id: true }
            }
          }
        },
        externalEducation: {
          select: {
            course_name: true,
            college_name: true,
            start_year: true,
            degree: {
              select: { degree_name: true }
            }
          }
        }
      }
    })

    if (!userDetails) throw new Error("!USER")

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
          course_id: myCollegeDegree.course?.course_id || "",
          department_id: myCollegeDegree.course?.department_id || "",
          degree_id: myCollegeDegree.course?.degree_id || "",
          college: MES_COLLEGE,
          year: myCollegeDegree.adm_year || "",
          graduationYear: myCollegeDegree.graduation_year || "",
          fromMyCollege: true,
          prn: myCollegeDegree.prn_number || "",
          isSaved: true,
        };
      }

      // Check externalEducation if not found in academicDetails
      const extDegree = userDetails.externalEducation?.find(
        (d) =>
          d.degree?.degree_name?.toLowerCase().includes(degreeType.toLowerCase())
      );

      if (extDegree) {
        const isMyCollege =
          extDegree.college_name?.toUpperCase() === MES_COLLEGE;
        return {
          course: extDegree.course_name || "",
          college: extDegree.college_name || "",
          year: extDegree.start_year || "",
          fromMyCollege: isMyCollege,
        };
      }


      return null;
    };

    const undergraduate = mapDegree("undergraduate");
    const postgraduate = mapDegree("postgraduate");

    const otherEducationsList = userDetails.externalEducation?.filter(
      (d) =>
        !d.degree?.degree_name?.toLowerCase().includes("undergraduate") &&
        !d.degree?.degree_name?.toLowerCase().includes("postgraduate")
    ) || [];

    const otherEducation = otherEducationsList.length > 0 ? {
      course: otherEducationsList[0].course_name || "",
      institute: otherEducationsList[0].college_name || ""
    } : null;

    return {
      ...userDetails,
      undergraduate,
      postgraduate,
      otherEducation,
      externalEducation: otherEducationsList
    };



  } catch (err) {
    throw err
  }

}

export async function updateProfile(userId, userData) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const updateData = {};

      if (userData.first_name) updateData.first_name = userData.first_name;
      if (userData.last_name) updateData.last_name = userData.last_name;
      if (userData.email) updateData.email = userData.email;
      if (userData.phone_number) updateData.phone_number = userData.phone_number;
      if (userData.gender) updateData.gender = userData.gender;
      if (userData.location) updateData.location = userData.location;
      if (userData.current_address) updateData.current_address = userData.current_address;
      if (userData.marital_status) updateData.marital_status = userData.marital_status;
      if (userData.date_of_birth) updateData.date_of_birth = new Date(userData.date_of_birth);

      if (userData.password) {
        // hash password before updating!
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        updateData.password = hashedPassword;
      }

      //updating basic user details
      const updateUser = await tx.user.update({
        where: { user_id: userId },
        data: updateData,
      });

      //updating professional details
      const prof = userData.professionalDetails?.[0] || null;
      if (prof) {
        const existingProf = await tx.professional_Detail.findFirst({
          where: { user_id: userId },
        });

        if (existingProf) {
          await tx.professional_Detail.update({
            where: { professional_id: existingProf.professional_id },
            data: {
              current_position: prof.current_position,
              company_name: prof.company_name,
              experience: prof.experience !== "" ? parseFloat(prof.experience) : null,
              work_email: prof.work_email,
              linkedin_profile: prof.linkedin_profile,
              instagram: prof.instagram,
              key_skills: prof.key_skills,
              industry_id: prof.industry?.industry_id ? parseInt(prof.industry?.industry_id) : null,
            },
          });
        } else {
          await tx.professional_Detail.create({
            data: {
              user_id: userId,
              current_position: prof.current_position,
              company_name: prof.company_name,
              experience: prof.experience !== "" ? parseFloat(prof.experience) : null,
              work_email: prof.work_email,
              linkedin_profile: prof.linkedin_profile,
              instagram: prof.instagram,
              key_skills: prof.key_skills,
              industry_id: prof.industry?.industry_id ? parseInt(prof.industry?.industry_id) : null,
            },
          });
        }
      }

      // Helper function to process education details
      async function processEducation(educationData, degreeNameFallback) {
        if (!educationData || !educationData.course) return;

        const collegeName = educationData.college || "";
        const isMesCollege = collegeName.toLowerCase().includes("mes marampally") || collegeName.toLowerCase().includes("mes college marampally");

        if (isMesCollege) {
          // Find the related course in our DB
          const courseDetails = await tx.course.findFirst({
            where: { course_name: { contains: educationData.course, mode: 'insensitive' } }
          });

          if (courseDetails) {
            // Check if there's already an academic detail for this course
            const existingAcademic = await tx.academic_Detail.findFirst({
              where: { user_id: userId, course_id: courseDetails.course_id }
            });

            if (existingAcademic) {
              await tx.academic_Detail.update({
                where: { academic_id: existingAcademic.academic_id },
                data: {
                  adm_year: educationData.year ? parseInt(educationData.year) : existingAcademic.adm_year,
                  graduation_year: educationData.graduationYear ? parseInt(educationData.graduationYear) : existingAcademic.graduation_year
                }
              });
            } else {
              // Creating new academic detail if one wasn't present
              const yearInt = educationData.year ? parseInt(educationData.year) : new Date().getFullYear();
              const gradYearInt = educationData.graduationYear ? parseInt(educationData.graduationYear) : yearInt + 3;
              const prn = educationData.prn || `TEMP-${userId}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
              await tx.academic_Detail.create({
                data: {
                  user_id: userId,
                  prn_number: prn,
                  adm_year: yearInt,
                  graduation_year: gradYearInt,
                  course_id: courseDetails.course_id
                }
              });
            }
          }
        } else {
          // Process as External Education

          let degreeId = null;
          if (degreeNameFallback) {
            const degree = await tx.degree.findFirst({
              where: { degree_name: { contains: degreeNameFallback, mode: 'insensitive' } }
            });
            if (degree) degreeId = degree.degree_id;
          }

          const existingExternal = await tx.external_Education.findFirst({
            where: {
              user_id: userId,
              course_name: educationData.course,
            }
          });

          if (existingExternal) {
            await tx.external_Education.update({
              where: { external_id: existingExternal.external_id },
              data: {
                college_name: educationData.college,
                start_year: educationData.year ? parseInt(educationData.year) : existingExternal.start_year,
                degree_id: degreeId,
              }
            });
          } else {
            await tx.external_Education.create({
              data: {
                user_id: userId,
                course_name: educationData.course,
                college_name: educationData.college,
                start_year: educationData.year ? parseInt(educationData.year) : null,
                degree_id: degreeId,
              }
            });
          }
        }
      }

      await processEducation(userData.undergraduate, "undergraduate");
      await processEducation(userData.postgraduate, "postgraduate");

      if (userData.otherEducation && userData.otherEducation.course) {
        await processEducation({
          course: userData.otherEducation.course,
          college: userData.otherEducation.institute || "Other Institute",
          year: null
        }, null);
      }

      return updateUser;
    });

    return result;
  } catch (err) {
    console.error("Error updating profile:", err);
    throw err;
  }
}
