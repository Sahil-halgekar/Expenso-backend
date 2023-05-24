const User = require('../models/User.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 12;
const signupController = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPassword = bcrypt.hashSync(password, salt);
    if (firstName === '' || lastName === '' || email === '' || password === '')
      return res.status(400).json({
        errorMessage: 'Please provide first name, last name, email & password.',
      });
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        errorMessage: 'Please provide a valid email.',
      });
    }
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        errorMessage:
          'Password must have at least 6 characters and contain at least one number, one lowercase and one uppercase letter.',
      });
    }
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
    return res.status(400).json(err);
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
    return res.status(400).json(err);
  }
}
const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (email === '' || password === '') {
      return res
        .status(400)
        .json({ errorMessage: 'Provide email and password.' });
    }
    const foundUser = await User.findOne({ email });
    if (!foundUser || foundUser.isTemp) {
      return res.status(400).json({ errorMessage: 'Wrong crendentials.' });
    } else {
      const passwordCorrect = bcrypt.compareSync(password, foundUser.password);
      if (passwordCorrect) {
        const payload = { _id: foundUser._id, email: foundUser.email };
        const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
          algorithm: 'HS256',
          expiresIn: '365d',
        });
        return res.status(200).json({ authToken: authToken });
      } else {
        return res.status(400).json({ errorMessage: 'Wrong crendentials.' });
      }
    }
  } catch (err) {
    return res.status(400).json(err);
  }
};
const verifyController = (req, res) => {
  res.status(200).json(req.payload);
};

module.exports = { loginController, signupController,updateController, verifyController };
