import prisma from "../../prismaClient.js";

export async function getCourses(departmentId,degreeId) {
    try{
        const courses = await prisma.course.findMany({
            where:{
                department_id:Number(departmentId),
                degree_id:Number(degreeId)
            },
            select:{
                course_id:true,
                course_name:true
            },
            orderBy:{
                course_name:"asc"
            }
        })
        if(courses.length === 0) throw new Error("NO_COURSE")
        return courses
    }catch(err){
        throw err
    }
}