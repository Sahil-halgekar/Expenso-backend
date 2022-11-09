const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const createError = require('http-errors');

// Signup Controller
const signupController = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);

    // Check if email or password or name are provided as empty string
    if (firstName === '' || lastName === '' || email === '' || password === '')
      return res.status(400).json({
        errorMessage: 'Please provide first name, last name, email & password.',
      });

    // Use regex to validate the email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid email.',
      });
    }

    // Use regex to validate the password format
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        errorMessage:
          'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
      });
    }

    // Check the users collection if a user with the same email already exists
    const user = await User.findOne({ email });

    if (user) {
      if (user.isTemp) {
        const createdUser = await User.findByIdAndUpdate(user._id, {
          firstName,
          lastName,
          password: hashedPassword,
          isTemp: false,
        });

        res.status(201).json({
          createdUser: createdUser._id,
        });
      } else {
        return res.status(400).json({
          errorMessage: 'User already exists.',
        });
      }
    } else {
      const createdUser = await User.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
      });

      res.status(201).json({
        createdUser: createdUser._id,
      });
    }
  } catch (err) {
    next(err);
  }
};
const updateController=async (req,res,next)=>{
  try{
    const data={};
    const email=req.body.email;
    const password=req.body.password;
    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    data.password=hashedPassword;
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        errorMessage:
          'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
      });
    }
    const user = await User.findOne({ email });
    if (user) {
        await User.findByIdAndUpdate(user._id,data,{new:true});}
        if(user.password!=hashedPassword)
        {
          return res.status(200).json("Password updated successfully")
        }
        else{
          return res.status(200).json("Password not updated")
        }
  }catch(err)
  {
    next(err);
  }
}
// Log In Controller
const loginController = async (req, res, next) => {
  try {
    // Get email and password from the body of the request
    const { email, password } = req.body;

    // Check if email or password are provided as empty string
    if (email === '' || password === '') {
      return res
        .status(400)
        .json({ errorMessage: 'Provide email and password.' });
    }

    // Check the users collection if a user with the same email exists
    const foundUser = await User.findOne({ email });
    if (!foundUser || foundUser.isTemp) {
      // If the user is not found, send an error response
      return res.status(400).json({ errorMessage: 'Wrong crendentials.' });
    } else {
      // Compare the provided password with the one saved in the database
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);

      if (passwordCorrect) {
        // Create an object that will be set as the token payload
        const payload = { _id: foundUser._id, email: foundUser.email };

        // Create and sign the token
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '365d',
        });

        // Send the token as the response
        return res.status(200).json({ authToken: authToken });
      } else {
        return res.status(400).json({ errorMessage: 'Wrong crendentials.' });
      }
    }
  } catch (err) {
    next(err);
  }
};

// Verify Controller
const verifyController = (req, res, next) => {
  // If JWT token is valid the payload gets decoded by the isAuthenticated middleware and made available on `req.payload`

  // Send back the object with user data previously set as the token payload
  res.status(200).json(req.payload);
};

module.exports = { loginController, signupController,updateController, verifyController };
