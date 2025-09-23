import * as authService from '../services/auth.services.js'

export async function register(req,res,next){

    try{
        const data= await authService.register(req.body);
         res.status(201).json({
      message: "User registered successfully",
      user: data.user
    });
    }catch(err){
         res.status(400).json({ 
      message: "Registration failed",
      error: err.message
    });
    }
}

export async function login(req,res,next) {
    try{
        const data = await authService.login(req.body);
        res.status(201).json({
            message:"Login Successful",
            token:data.token,
            user:data.user
        })
    }catch(err){
        if (err.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    if (err.message === "USER_PENDING") {
      return res.status(401).json({ message: "Your account approval is pending" });
    }
    if (err.message === "INVALID_PASSWORD") {
      return res.status(401).json({ message: "Invalid password" });
    }

    res.status(500).json({ message: "Server error",err:err.message });
    }
}