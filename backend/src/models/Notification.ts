// notifications
import mongoose from "mongoose";

let NotificationScheme=new mongoose.Schema({
    active:{
        type: "boolean",
        default:true
    },
    notifications:[{
        type: String,
    }]
});

export default mongoose.model("notifications",NotificationScheme);