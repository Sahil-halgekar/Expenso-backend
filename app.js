const express=require("express");
const cors = require("cors");
const dotenv=require("dotenv");
const mongoose=require("mongoose");

const app=express();
app.use(cors());
dotenv.config();
app.use(express.json());


app.listen(process.env.PORT|| 5000,()=>{
    console.log("backend is running");
})
app.get("/",(req,res)=>res.send("Hello"));