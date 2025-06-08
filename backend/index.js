import express from 'express';
import dotenv from 'dotenv';
import {clerkMiddleware} from '@clerk/express';
import fileUpload from "express-fileupload"
import path from "path";
import cors from "cors";
import cron from 'node-cron';
import fs from 'fs';
import userRoutes from './src/routes/userRoute.js';
import adminRoutes from './src/routes/adminRoute.js';
import authRoutes from './src/routes/authRoute.js';
import songRoutes from './src/routes/songRoute.js';
import albumRoutes from './src/routes/albumRoute.js';
import statsRoutes from './src/routes/statsRoute.js';

import { connectDB } from './src/lib/db.js';
import { initializeSocket } from './src/lib/socket.js';
import { createServer } from 'http';
import { fstat } from 'fs';


dotenv.config();

const app=express();
const __dirname=path.resolve();

const PORT=process.env.PORT;

const httpServer=createServer(app);
initializeSocket(httpServer);

app.use(cors({
    origin: "http://localhost:3000",
    credentials:true,
}));


app.use(express.json());
// we put these before our routes so it will be implemented before any files are created
app.use(clerkMiddleware());
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir:path.join(__dirname, "tmp"),
    createParentPath: true,
    limits:{
        fileSize: 10*1024*1024
    },
}))

//cron jobs
//delete every minute
const tempDir=path.join(process.cwd(), "tmp");
cron.schedule("0 * * * *", ()=>{
    if(fs.existsSync(tempDir)){
        fs.readdir(tempDir, (err, files)=>{
            if(err){
                console.log("error", err);
                return;
            }
            for(const file of files){
                fs.unlink(path.join(tempDir, file), (err)=>{}) 
            }
        });
    }
})

app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/songs", songRoutes);
app.use("/api/albums", albumRoutes);
app.use("/api/stats", statsRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname, "../frontend/dist")));
    app.get("*", (req, res)=>{
        res.sendFile(path.resolve(__dirname, "../frontend","dist","index.html"));
    })
}
//error handler
app.use((err, req, res, next)=>{
    res.status(500).json({message: process.env.NODE_ENV==="production" ? "Internal Server Error" : err.message})
})

httpServer.listen(PORT, ()=>{
    console.log('Server is running on port '+PORT);
    connectDB();
})

