const express=require("express");
const cors = require("cors");
const dotenv=require("dotenv");
const mongoose=require("mongoose");
const authRoutes = require('./auth.routes');
const groupRoutes = require('./group.routes');
const expenseRoutes = require('./expense.routes');
const userRoutes = require('./user.routes');
const commentRoutes = require('./comment.routes');
const cookieParser = require("cookie-parser");

const app=express();
app.use(cors());
dotenv.config();
app.use(express.json());

const MONGO_URI =process.env.DB;

const connectDB = async function () {
  try {
    const x = await mongoose.connect(MONGO_URI);
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`
    );
  } catch (err) {
    console.error('Error connecting to mongo: ', err);
  }
};

connectDB();


// Auth routes
router.use('/auth', authRoutes);



// Group routes
app.use('/api/groups', groupRoutes);

// Expense routes
app.use('/api/groups/:groupId/expenses', expenseRoutes);

// Comment routes
app.use('/api/groups/:groupId/expenses/:expenseId/comments', commentRoutes);

// User routes
app.use('/api/userInfo', userRoutes);

require('./error-handling')(app);
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());


app.listen(process.env.PORT|| 5000,()=>{
    console.log("backend is running");
})