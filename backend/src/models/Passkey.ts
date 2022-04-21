import mongoose from "mongoose";

let passketSchema=new mongoose.Schema({
    candidates:[{
        type: String
    }],
    answers:[]
});

export default mongoose.model("passkey",passketSchema);