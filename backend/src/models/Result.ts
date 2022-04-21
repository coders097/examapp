import mongoose from "mongoose";

let resultSchema=new mongoose.Schema({
    results:[{
        name:{
            type:String,
            required:true
        },
        regdNo:{
            type:String,
            required:true
        },
        answerSheet:{
            prog: [{
                _id: {type:String, required:true},
                code: {type:String, required:true}
            }],
            mcq: [{
                id: {type:String, required:true},
                answer: {type:String, required:true}
            }]
        }
    }]
});

export default mongoose.model("results",resultSchema);