import { User } from "../models/userModel.js";

export const authCallback = async (req, res, next)=>{
    try{
        const {id, firstName, lastName, imageUrl }=req.body;
        //check if user already exists
        const user=await User.findOne({clerkId: id});

        if(!user){
            //signup
            await User.create({
                clerkId: id,
                fullName: `${firstName || ""} ${lastName || ""}`.trim(),
                imageUrl,
            })

            // console.log('Frontend - User data:', {
            //     id: newUser.id,
            //     firstName: newUser.firstName,
            //     lastName: newUser.lastName,
            //     imageUrl: newUser.imageUrl,})
        }
        res.status(200).json({success: true});
    }
    catch(error){
        console.log("Error in auth callback", error);
        next(error);
    }
}