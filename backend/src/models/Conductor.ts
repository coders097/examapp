import mongoose from "mongoose";

let conductorScheme=new mongoose.Schema({
   status:{
       type: Boolean,
       default: false
   },
   startDateTime:{ 
       type: String, // Value in GMT
       default:""
   },
   endDateTime:{
       type: String,
       default:""
   },
   markPerQuestion:{
       type: Number,
       default:0
   },
   noOfQuestions:{
       type: Number,
       default:0
   },
   randomiseQuestion:{
       type: Boolean,
       default:false
   },
   testTimeInMin:{
       type: Number,
       default:15
   },
   passkeys:[{
       type: String,
       ref:"passkey"
   }], 
   results:{
       type: mongoose.SchemaTypes.ObjectId,
       ref:"results" 
   }
});

export default mongoose.model("conductor",conductorScheme);