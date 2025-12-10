import mongoose from 'mongoose';


const responseSchema = new mongoose.Schema(
    {
        formId :
            {
            type: mongoose.Schema.Types.ObjectId,
            ref : 'Form',
            required : true,
         },
         airtableRecordId : {
            type: String,
            required : [true, "aittableRecordID is required in response"],
            unique: true,

         },
         answers : {
            type : mongoose.Schema.Types.Mixed, // why mixed because here i want json raw data so i used mixed here

         },

         deletedInAirtable : {
            type: Boolean,
            default: false,
         },

    },
    {
        timestamps : true,
    }


);

export const Response = mongoose.model('Response',responseSchema);