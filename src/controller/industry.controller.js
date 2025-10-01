import { getIndustry } from "../services/industry.services.js";

export async function getIndustryControl(req,res) {

    try{
        const industries = await getIndustry()

        res.json({success:true,data:industries})
    }catch(err){
        if(err.message="NO_INDUSTRIES"){return res.status(400).json({success:false,message:"No industries found"})}

        res.status(500).json({success:false,message:err.message})
    }
    
}