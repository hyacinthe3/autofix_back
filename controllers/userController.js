import User from "../models/userModel.js";
import bcrypt from "bcryptjs"; 
import { generateAccessToken } from "../utilis/tokenGenerating.js";



export const Register =async (req,res) =>{

    try{
        const{
            Names,userEmail,phoneNumber,userPassword,userRole} =req.body 

        const existingUser = await User.findOne({userEmail});
        if(existingUser){
            return res.status(400).json({message:"email already exists"});
        }
       const hashedPassword = await bcrypt.hash(userPassword,10);

       const user = new User({
    Names,userEmail,phoneNumber,userPassword:hashedPassword,userRole
       });
       user.tokens.accessToken=generateAccessToken(user);
       await user.save();
       res.status(201).json({
        message:"Account created Successfully!",
        user:{
          _id:user._id,
          Names:user.Names,
          userEmail:user.userEmail,
          userRole:user.userRole,
          phoneNumber:user.phoneNumber,
            tokens:{
                accesssToken:user.tokens.accessToken,
            },
        },
       }); 
    }catch (error){
        res.status(500).json({message:"Failed to register user", error:error.message});
    }
};


export const Login = async (req, res) => {
    try {
      const { userEmail, userPassword } = req.body;
      const user = await User.findOne({ userEmail });
  
      if (!user) {
        // User not found
        return res.status(404).json({ message: "User not found" });
      }
  
      const isMatch = await bcrypt.compare(userPassword, user.userPassword);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const accessToken = generateAccessToken(user);
  
  
      user.tokens.accessToken = accessToken;
  
      await user.save();
  
      const userResponse = {
        _id:user._id,
        Names:user.Names,
        userEmail:user.userEmail,
        phoneNumber:user.phoneNumber,
        userRole:user.userRole,
        tokens: { accessToken: user.tokens.accessToken},
      };
    
      res.json({ user: userResponse });
    } catch (error) {
      // General error handling
      res.status(500).json({ message: "Server error", error: error.message});
}
};