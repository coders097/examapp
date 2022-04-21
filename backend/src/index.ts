import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

// Initializations
let app=express();


// Middlewares
app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}));
app.use(express.json());
app.use(express.urlencoded({ extended:true}));
app.use(cookieParser());
app.use(morgan("dev"));

// Configurations
dotenv.config({ 
    path:path.join(__dirname,"./config.env")
});


// routes
import CodeRunnerRoute from './routes/code/codeRunner';
app.use("/code",CodeRunnerRoute);
import AuthRoute from './routes/auth/auth';
app.use("/auth",AuthRoute);
import CandidateRoute from './routes/candi/candidate';
app.use("/candidate",CandidateRoute);
import OrganisationRoute from './routes/orga/organisation';
app.use("/organisation",OrganisationRoute);

// connecting to mongodb
mongoose.connect(process.env.MONGO_URL as string);
const db=mongoose.connection;
db.on('error',()=>console.log("connection error"));
db.once('open',()=>{
    console.log("We are connected!");
});

const PORT=process.env.PORT || 3001;
app.listen(PORT as number,"localhost",()=>{
    console.log("Started at ",PORT);
});