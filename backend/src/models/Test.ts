import mongoose from "mongoose";

let testSchema=new mongoose.Schema({
    name:{
        type:String
    },
    mcqQuestions:[{
        question:{
            type:String,
            required:true
        },
        options:[{
            type:String
        }],
        answer:{
            type:String,
            required:true
        },
        id:{
            type:String,
            required:true
        }
    }],
    progQuestions:[{ 
        question:{ 
            title:{
                type:String,
                required:true
            },
            description:{
                type:String, // for next line insert <$$>
                required:true
            },
            examples:[{
                input:{ 
                    type:String 
                },
                output:{
                    type:String
                }
            }] 
        },
        testCasesFile:{
            type:String
        },
        outputsFile:{
            type:String
        }
    }],
    batches:[{ 
        type:mongoose.SchemaTypes.ObjectId,
        ref:"batch"
    }],
    dateOfCreation:{
        type:Date,
        default:Date.now
    },
    conductor:{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"conductor"
    }
});

export default mongoose.model("test",testSchema);