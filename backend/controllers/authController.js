const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

/**
 * @description Generate JWT Token
 * @access Private
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};


/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Please add all required fields' });
  }

  // 1. Check if user already exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: 'user',
    credits: 10
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data registration failed' });
  }
};

/**
 * @desc    Authenticate a user
 * @route   POST /api/auth/login
 * @access  Public
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1. Find user by email
  const user = await User.findOne({ email: email.toLowerCase() });

  // 2. Verify password and check if suspended (Page 8 Admin feature)
  if (user && (await bcrypt.compare(password, user.password))) {
    
    if (user.isSuspended) {
      return res.status(403).json({ message: 'Account is suspended. Contact Admin.' });
    }

    // Update last login (Optional: good for Admin Module analytics)
    user.lastLogin = Date.now();
    await user.save();

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      credits: user.credits,
      token: generateToken(user.id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res) => {
  res.status(200).json(req.user);
};

module.exports = { registerUser, loginUser, getMe };
