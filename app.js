const express=require("express");
const cors = require("cors");
const dotenv=require("dotenv");
const mongoose=require("mongoose");

const cookieParser = require("cookie-parser");

const app=express();
app.use(cors());
dotenv.config();
app.use(express.json());

const MONGO_URI =process.env.DB;

const connectDB = async function () {
  mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));
};

connectDB();

const allRoutes = require('./routes/index.routes');
app.use('/api', allRoutes);

require('./error-handling')(app);
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.listen(process.env.PORT || 5000,()=>{
    console.log("backend is running");
})