const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Signup
  signup: async (req, res) => {
    try {
      console.log('Signup request received:', { body: req.body });
      const { firstName, lastName, email, password, confirmPassword, role } = req.body;

      // Validation
      if (!firstName || !lastName || !email || !password || !confirmPassword || !role) {
        console.warn('Signup Validation failed: Missing required fields');
        return res.status(400).json({
          success: false,
          message: 'All fields are required'
        });
      }

      if (password !== confirmPassword) {
        console.warn('Signup Validation failed: Passwords do not match');
        return res.status(400).json({
          success: false,
          message: 'Passwords do not match'
        });
      }

      if (password.length < 6) {
        console.warn('Signup Validation failed: Password too short');
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long'
        });
      }

      // Check if user already exists
      console.log('Checking if user exists with email:', email.toLowerCase());
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        console.warn('Signup failed: User already exists');
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      console.log('Hashing password for new user');
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      console.log('Creating new user document');
      const newUser = new User({
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        email: email.toLowerCase(),
        password: hashedPassword,
        role,
        skills: []
      });

      console.log('Saving new user to database');
      await newUser.save();
      console.log('User saved successfully:', newUser._id);

      // Generate token
      console.log('Generating JWT token');
      const token = jwt.sign(
        { userId: newUser._id, role: newUser.role, email: newUser.email },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' }
      );

      console.log('Signup successful for:', email);
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          skills: newUser.skills
        }
      });
    } catch (error) {
      console.error('Signup error - Full stack:', error);
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error during signup',
        error: error.message
      });
    }
  },

  // Login
  login: async (req, res) => {
    const { email, password } = req.body;

    try {
      console.log('Login attempt:', { email });
      const user = await User.findOne({ email });
      if (!user) {
        console.error('User not found:', email);
        return res.status(404).json({ message: 'User not found' });
      }

      console.log('User found:', user);

      if (!user.isApproved && user.role !== 'lab_admin') {
        console.warn('User not approved:', user);
        return res.status(403).json({ message: 'Your account is not approved yet.' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.warn('Invalid credentials for user:', email);
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      console.log('Password matched for user:', email);

      const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });

      console.log('Token generated for user:', email);

      res.status(200).json({
        success: true, // Added success field
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      res.status(500).json({ message: 'Error logging in', error });
    }
  },

  // Get current user
  getCurrentUser: async (req, res) => {
    try {
      const userId = req.user.userId; // Set by auth middleware

      const user = await User.findById(userId).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          lab: user.lab,
          skills: user.skills
        }
      });
    } catch (error) {
      console.error('Error fetching current user:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error.message
      });
    }
  },

  // Get all technicians with specific skill
  getTechniciansBySkill: async (req, res) => {
    try {
      const { skill } = req.query;

      console.log('Fetching technicians with skill:', skill);

      if (!skill) {
        return res.status(400).json({
          success: false,
          message: 'Skill parameter is required'
        });
      }

      const technicians = await User.find({
        role: 'lab_technician',
        skills: skill,
        isActive: true
      }).select('-password');

      console.log(`Found ${technicians.length} technicians with skill: ${skill}`);
      console.log('Technicians data:', technicians);

      res.status(200).json({
        success: true,
        count: technicians.length,
        data: technicians
      });
    } catch (error) {
      console.error('Error fetching technicians:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching technicians',
        error: error.message
      });
    }
  },

  // Update technician skills
  updateTechnicianSkills: async (req, res) => {
    try {
      const userId = req.user.userId;
      const { skills } = req.body;

      console.log('Update skills request - userId:', userId, 'skills:', skills);

      // Validation
      if (!skills || !Array.isArray(skills) || skills.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Please select at least one skill'
        });
      }

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if user is a technician
      if (user.role !== 'lab_technician') {
        return res.status(403).json({
          success: false,
          message: 'Only technicians can update skills'
        });
      }

      // Update skills
      user.skills = skills;
      await user.save();

      console.log('Skills updated successfully for user:', userId, 'New skills:', user.skills);

      res.status(200).json({
        success: true,
        message: 'Skills updated successfully',
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          skills: user.skills
        }
      });
    } catch (error) {
      console.error('Error updating skills:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating skills',
        error: error.message
      });
    }
  }
};

module.exports = authController;
