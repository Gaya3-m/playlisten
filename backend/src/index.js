import express from 'express';
import dotenv from 'dotenv';
import {clerkMiddleware} from '@clerk/express';
import fileUpload from "express-fileupload"
import path from "path";
import cors from "cors";

import userRoutes from './routes/userRoute.js';
import adminRoutes from './routes/adminRoute.js';
import authRoutes from './routes/authRoute.js';
import songRoutes from './routes/songRoute.js';
import albumRoutes from './routes/albumRoute.js';
import statsRoutes from './routes/statsRoute.js';

import { connectDB } from './lib/db.js';
import { initializeSocket } from './lib/socket.js';
import { createServer } from 'http';


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

