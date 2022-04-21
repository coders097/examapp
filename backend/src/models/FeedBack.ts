import mongoose from "mongoose";

let feedbackSchema=new mongoose.Schema({
    type:{
        type:String
    },
    feedback:{
        type: String
    },
    pics:[{
        type: String
    }]
});

export default mongoose.model('feedback',feedbackSchema);