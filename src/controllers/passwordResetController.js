const crypto = require('crypto');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const baseUrl = process.env.BASE_URL || 'https://localhost:5000';
    const resetUrl = `${baseUrl}/api/auth/reset-password?token=${token}`;
    await sendEmail(user.email, 'Password Reset', `Reset your password: ${resetUrl}`);
  }
  res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
};

// POST /api/auth/reset-password
exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });
  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  res.json({ message: 'Password has been reset.' });
};
