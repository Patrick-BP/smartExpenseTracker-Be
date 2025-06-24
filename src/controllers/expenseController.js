const Expense = require('../models/Expense');

const expenseController = {
  // Create new expense
  async create(req, res) {
    
    try {
      const expense = new Expense({
        ...req.body,
        user: req.user._id
      });
      
      await expense.save();
      res.status(201).json(expense);
    } catch (error) {
      res.status(400).json({
        error: 'Failed to create expense',
        message: error.message
      });
    }
  },

  // Get all expenses for user with pagination and filters
  async getAll(req, res) {
    try {
      const match = { user: req.user._id };
      const sort = {};

      // Apply filters
      if (req.query.category) {
        match.category = req.query.category;
      }

      if (req.query.startDate && req.query.endDate) {
        match.date = {
          $gte: new Date(req.query.startDate),
          $lte: new Date(req.query.endDate)
        };
      }

      // Apply sorting
      if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':');
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
      } else {
        sort.date = -1; // Default sort by date descending
      }

      // Pagination
      const limit = parseInt(req.query.limit) || 10;
      const page = parseInt(req.query.page) || 1;
      const skip = (page - 1) * limit;

      const expenses = await Expense.find(match)
        .sort(sort)
        .limit(limit)
        .skip(skip);

      const total = await Expense.countDocuments(match);

      res.json({
        expenses,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch expenses',
        message: error.message
      });
    }
  },

  // Get expense by id
  async getById(req, res) {
    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch expense',
        message: error.message
      });
    }
  },

  // Update expense
  async update(req, res) {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['amount', 'category', 'description', 'date', 'paymentMethod', 'location', 'tags'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    try {
      const expense = await Expense.findOne({
        _id: req.params.id,
        user: req.user._id
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      updates.forEach(update => expense[update] = req.body[update]);
      await expense.save();

      res.json(expense);
    } catch (error) {
      res.status(400).json({
        error: 'Update failed',
        message: error.message
      });
    }
  },

  // Delete expense
  async delete(req, res) {
    try {
      const expense = await Expense.findOneAndDelete({
        _id: req.params.id,
        user: req.user._id
      });

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json({ message: 'Expense deleted successfully' });
    } catch (error) {
      res.status(400).json({
        error: 'Delete failed',
        message: error.message
      });
    }
  },

  // Get monthly statistics
  async getMonthlyStats(req, res) {
    try {
      const { month, year } = req.query;
      const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;
      const currentYear = year ? parseInt(year) : new Date().getFullYear();

      const totalExpenses = await Expense.getMonthlyTotalByType(req.user._id, currentMonth, currentYear, 'expense');
      const totalIncome = await Expense.getMonthlyTotalByType(req.user._id, currentMonth, currentYear, 'income');
      const expenseCategoryTotals = await Expense.getMonthlyCategoryTotalsByType(req.user._id, currentMonth, currentYear, 'expense');
      const incomeCategoryTotals = await Expense.getMonthlyCategoryTotalsByType(req.user._id, currentMonth, currentYear, 'income');

      res.json({
        month: currentMonth,
        year: currentYear,
        totalExpenses,
        totalIncome,
        expenseCategoryTotals,
        incomeCategoryTotals,
        netIncome: totalIncome - totalExpenses
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch statistics',
        message: error.message
      });
    }
  },

  // Get weekly statistics
  async getWeeklyStats(req, res) {
    try {
      const { weekStart, weekEnd } = req.query;
      const start = weekStart ? new Date(weekStart) : new Date();
      const end = weekEnd ? new Date(weekEnd) : new Date();
      // Weekly expenses
      const expenseCategoryTotals = await Expense.getWeeklyStatsByType(req.user._id, start, end, 'expense');
      const totalExpenses = expenseCategoryTotals.reduce((sum, cat) => sum + (cat.total || 0), 0);

      // Monthly income (for the month containing weekStart)
      const incomeMonth = start.getMonth() + 1;
      const incomeYear = start.getFullYear();
      const incomeCategoryTotals = await Expense.getMonthlyCategoryTotalsByType(req.user._id, incomeMonth, incomeYear, 'income');
      const totalIncome = incomeCategoryTotals.reduce((sum, cat) => sum + (cat.total || 0), 0);

      res.json({
        weekStart: start,
        weekEnd: end,
        totalExpenses,
        expenseCategoryTotals,
        totalIncome,
        incomeCategoryTotals,
        netIncome: totalIncome - totalExpenses
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch weekly statistics',
        message: error.message
      });
    }
  },

  // Get yearly statistics
  async getYearlyStats(req, res) {
    try {
      const { year } = req.query;
      const currentYear = year ? parseInt(year) : new Date().getFullYear();
      const expenseCategoryTotals = await Expense.getYearlyStatsByType(req.user._id, currentYear, 'expense');
      const incomeCategoryTotals = await Expense.getYearlyStatsByType(req.user._id, currentYear, 'income');
      const totalExpenses = expenseCategoryTotals.reduce((sum, cat) => sum + (cat.total || 0), 0);
      const totalIncome = incomeCategoryTotals.reduce((sum, cat) => sum + (cat.total || 0), 0);
      res.json({
        year: currentYear,
        totalExpenses,
        totalIncome,
        expenseCategoryTotals,
        incomeCategoryTotals,
        netIncome: totalIncome - totalExpenses
      });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch yearly statistics',
        message: error.message
      });
    }
  },

  // Get timeline statistics
  async getTimelineStats(req, res) {
    try {
      const { period, year, month, type } = req.query;
      const timeline = await Expense.getTimeline(req.user._id, period, parseInt(year), parseInt(month), type);
      res.json({ timeline });
    } catch (error) {
      res.status(400).json({
        error: 'Failed to fetch timeline statistics',
        message: error.message
      });
    }
  }
};

module.exports = expenseController;