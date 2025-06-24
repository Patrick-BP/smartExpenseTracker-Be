const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { auth } = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Create expense
router.post('/', expenseController.create);

// Get all expenses with filters and pagination
router.get('/', expenseController.getAll);

// Get monthly statistics
router.get('/stats', expenseController.getMonthlyStats);
// Get weekly statistics
router.get('/stats/week', expenseController.getWeeklyStats);
// Get yearly statistics
router.get('/stats/year', expenseController.getYearlyStats);
// Get timeline statistics
router.get('/stats/timeline', expenseController.getTimelineStats);

// Get specific expense
router.get('/:id', expenseController.getById);

// Update expense
router.patch('/:id', expenseController.update);

// Delete expense
router.delete('/:id', expenseController.delete);

module.exports = router;