const User = require("../models/userSchema");
const jwt=require('jsonwebtoken');
const bcrypt=require('bcrypt');
const nodemailer=require('nodemailer');

exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await User.findOne({ email});
    if (user) {
     return res.status(400).json("User already exists");
    }
    // const hashPassword= await bcrypt.hash(password,10)
    const newUser = await User.create({
      name,
      email,
      password,
    });
     //await newUser.save();
    res.status(200).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



exports.loginUser = async (req, res, next) => {
  try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
          return res.status(401).json({ message: "Invalid Credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
          return res.status(401).json({ message: "Invalid Credentials" });
      }
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      res.cookie('token', token);
      res.status(200).json({
          message: 'User logged in',
          id: user._id,
          token: token,
      });

  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


exports.forgetPassword= async(req,res,next)=>{
  try{

    const {email}=req.body;
    const user= await User.findOne({email});
    if(!user)
    {
      return res.status(401).json({message:"user doesn't exist"});
    }
    let token=jwt.sign({id:user._id},process.env.JWT_SECRET,{expiresIn:"1d"});
    var transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'fortwitteronli8052@gmail.com',
        pass: process.env.PASSKEY
      }
    });
    
    var mailOptions = {
      from: 'fortwitteronli8052@gmail.com',
      to: `${email}`,
      subject: 'Reset password link',
      text: `http://localhost:5000/v1/api/user/reset-password/${user._id}/${token}`,
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
      } else {
       return res.status(200).json({message:"mail send",token: token});
      }
    });


  }
  catch(err)
  {
    res.status(500).json({error: err.message});
  }

};


exports.resetPassword= async(req,res,next)=>{
  const {id,token}=req.params;
  const {password}=req.body;
  jwt.verify(token,process.env.JWT_SECRET, async(err,decoded)=>
{
  if(err)
  return res.status(401).json({error: "something wrong with the token"});
else
{
  const hashedPassword=await bcrypt.hash(password,10);
  const response =await User.findByIdAndUpdate({_id:id},{password:hashedPassword});
  if(response)
  return res.status(200).json({Status:"success"});
else
return res.status(404).json({Status:err})
}
}).catch(e=> res.json({status:e}));

};


