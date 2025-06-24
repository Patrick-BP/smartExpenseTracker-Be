const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

const userController = {
  // Register new user
  async register(req, res) {
    try {
      const { name, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create new user
      const user = new User({
        name,
        email,
        password
      });

      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.status(201).json({
        token,
        user: user.toPublicJSON()
      });
    } catch (error) {
      res.status(400).json({
        error: 'Registration failed',
        message: error.message
      });
    }
  },

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      res.json({
        token,
        user: user.toPublicJSON()
      });
    } catch (error) {
      res.status(400).json({
        error: 'Login failed',
        message: error.message
      });
    }
  },

  // Get user profile
  async getProfile(req, res) {
    try {
      res.json(req.user.toPublicJSON());
    } catch (error) {
      res.status(400).json({
        error: 'Failed to get profile',
        message: error.message
      });
    }
  },

  // Update user profile
  async updateProfile(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'monthlyBudget', 'categoryBudgets'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
      updates.forEach(update => req.user[update] = req.body[update]);
      await req.user.save();

      res.json(req.user.toPublicJSON());
    } catch (error) {
      res.status(400).json({
        error: 'Update failed',
        message: error.message
      });
    }
  },

  // Update password
  async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Verify current password
      const isMatch = await req.user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Update password
      req.user.password = newPassword;
      await req.user.save();

      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      res.status(400).json({
        error: 'Password update failed',
        message: error.message
      });
    }
  }
};

module.exports = userController;