import mongoose from "mongoose";

let orgaSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    phone:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    pic:{
        type:String
    },
    tests:[{
        type:mongoose.SchemaTypes.ObjectId,
        ref:"test"
    }],
    batches:[{ 
        type:mongoose.SchemaTypes.ObjectId,
        ref:"batch" 
    }],
    dateOfCreation:{
        type:Date,
        default:Date.now
    },
    notifications:{
        type:mongoose.SchemaTypes.ObjectId,
        required:true,
        ref:"notifications"
    }, 
    keepMeLoggedIn:{
        type:Boolean,
        default:true
    }
});

export default mongoose.model("organisation",orgaSchema);