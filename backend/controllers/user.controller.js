const userModel=require('../models/user.model');
const userService=require('../services/user.service');
const {validationResult}=require('express-validator');
const blacklistTokenModel = require('../models/blacklistToken.model');
// Additional controller functions will be added here in the future 

module.exports.registerUser=async (req,res, next)=>{
    try{
        const {fullname,email,password}=req.body;
        const existingUser=await userModel.findOne({
            email:email
        });

        if(existingUser)
        {
            return res.status(400).json({message:'User with this email already exists'});
        }
        const hashedPassword=await userModel.hashPassword(password);

        const newUser=new userModel({
            fullname:{
                firstname:fullname.firstname,
                lastname:fullname.lastname
            },
            email:email,
            password:hashedPassword
        });
        await newUser.save();

        const token=newUser.generateAuthToken();
        res.status(201).json({token:token,message:'User registered successfully'});
    }
    catch(err)
    {
        console.error('Error registering user:', err);
        res.status(500).json({message:'Internal server error'});
    }
}

module.exports.loginUser=async (req,res,next)=>{
    try{
        const {email,password}=req.body;    
        const user=await userModel.findOne({email:email}).select('+password');

        if(!user)
        {
            return res.status(401).json({message:'Invalid email or password'});
        }
        const isMatch=await user.comparePassword(password);

        if(!isMatch)
        {
            return res.status(401).json({message:'Invalid email or password'});
        }
        const token=user.generateAuthToken();
        res.cookie('token', token);
        res.status(200).json({token:token,message:'User logged in successfully'});
    }
    catch(err)
    {
        console.error('Error logging in user:', err);
        res.status(500).json({message:'Internal server error'});
    }
}


module.exports.getUserProfile=async (req,res,next)=>{
   res.status(200).json({user:req.user});
   

}
 

module.exports.logoutUser=async (req,res,next)=>{
  
        res.clearCookie('token');
    const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);

    await blacklistTokenModel.create({ token });
        // Here, you would typically add the token to a blacklist to invalidate it
        // For simplicity, we'll just clear the cookie
        res.status(200).json({message:'User logged out successfully'}); 

}
