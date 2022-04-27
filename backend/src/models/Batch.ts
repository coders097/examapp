import mongoose from "mongoose";

let batchSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    candidates:[{
        name:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true
        },
        regdNo:{
            type:String,
            required:true
        }
    }],
    dateOfCreation:{
        type:Date,
        default:Date.now
    },
    tests:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"test" 
    }]
});

export default mongoose.model("batch",batchSchema);