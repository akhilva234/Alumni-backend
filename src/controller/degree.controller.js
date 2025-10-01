import { getDegree } from "../services/degree.services.js";

export async function getDegreeContol(req,res) {

    try{

        const degrees = await getDegree()
        res.json({succes:true,data:degrees})

    }catch(err){
        if(err.message){
            return res.status(400).json({succes:false,message:"No degrees found"})
        }
        res.status(500).json({success:false,message:err.message})
    }
    
}