import { getDepartments } from "../services/dept.services.js";

export async function getDeptController(req,res) {

    try{

    const depts = await getDepartments()
    res.json({success:true,data:depts})

    }catch(err){
        res.status(500).json({ success: false, message: err.message });
    }
    
}