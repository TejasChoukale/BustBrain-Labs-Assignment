import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
    {
        email : {
            type: String,
            trim: true,
            unique:true,
        },

        airtableUserId : {
            type: String,
            required : [true, 'airtable used ir is required'],
            unique: true,
        },
        accessToken : {
            type: String,
            required : [true, "access Token is Required"],
        },
        refreshToken :{
            type: String,
            required :[true, "refresh Token is required"],
        },


    },
    {
        timestamps: true,
    }
);

export const User = mongoose.model("User",userSchema);