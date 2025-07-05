const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

// GET /notifications - fetch all notifications for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ date: -1 });
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
