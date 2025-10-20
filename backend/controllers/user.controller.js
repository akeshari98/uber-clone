const userModel=require('../models/user.model');
const userService=require('../services/user.service');
const {validationResult}=require('express-validator');
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
        res.status(200).json({token:token,message:'User logged in successfully'});
    }
    catch(err)
    {
        console.error('Error logging in user:', err);
        res.status(500).json({message:'Internal server error'});
    }
}

