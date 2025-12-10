import mongoose from 'mongoose';
// import Schema from 'mongoose'; schema is property of mongoose ok


const formSchema = new mongoose.Schema(
    {
        formOwner: {
            type :mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required :[true,"owner is refering to userID which is reqired"],
        },
        airtableBaseId : {
            type: String,
            required : [true, "airtableBaseId is required"],
        },
        airtableTableId : {
            type: String,
            required : [true, "airtableTableId is required"],
        },
        title : {
            type: String
        },
        questions :
            [{
                questionKey : {
                    type : String,
                    required : [true, "questionKey is required"],
                },
                airtableFieldId : {
                    type : String,
                    required : [true, "airtableFieldId is required"],
                },
                label : {
                    type: String,
                    required : [true, "Label is required"],
                },
                required:{
                    type: Boolean,
                    default : false,
                },
                conditionalRules : {
                    logic :{
                        type: String,
                        enum : ['AND','OR'],
                    },
                    conditions: [{
                        questionKey :{
                            type: String,
                        },
                        operator : {
                            type: String,
                            enum : ['equals', 'notEquals', 'contains'],
                        },
                        value : {
                            type : String,
                        }
                     }],
                },
                type: {
                    type: String,
                    enum : ['shortText','longText','singleSelect','multiSelect','attachment']
                }
            }]
    },
    {
        timestamps: true,

    }
);

export const Form = mongoose.model("Form", formSchema);