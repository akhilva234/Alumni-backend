import { getMiniProfile } from "../services/user.services.js";
import { getFullProfile,updateProfile } from "../services/user.services.js";

export const MiniProfile = async (req, res) => {
  try {
    const user = await getMiniProfile(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching mini profile", error: err.message });
  }
};

export const FullProfile = async (req,res)=>{
  try{
    const user = await getFullProfile(req.user.id)

    if(!user){
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user)
  }catch(err){
        res.status(500).json({ message: "Error fetching  profile", error: err.message });
  }
}

export async function UpdateProfile(req,res,next){

  try{
    const userId= req.user.id;
    const data = await updateProfile(userId,req.body);

    res.status(201).json({
      success:true,
      message:"User Updated Succesfully",
    });
  }catch(err){
    res.status(500).json({
      success:false,
      message:"User Updation Failed",
      error:err.message
    });
  }
}