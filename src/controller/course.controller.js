import { getCourses } from "../services/course.services.js";

export async function getCoursesControl(req,res) {
    
    try{
        const {departmentId,degreeId} = req.query
        const courses = await getCourses(departmentId,degreeId)
        res.json({success:true,data:courses})

    }catch(err){
        if(err.message==='NO_COURSE'){
           return res.status(400).json({success:false,message:"No Courses Found"})
        }
        res.status(500).json({success:false,message:err.message})
    }
}