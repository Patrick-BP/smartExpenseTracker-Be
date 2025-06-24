const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['expense', 'income'],
    default: 'expense'
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true,
    enum: [
      // Expense categories
      'Food',
      'Transportation',
      'Housing',
      'Utilities',
      'Entertainment',
      'Healthcare',
      'Shopping',
      'Education',
      'Personal Care',
      'Debt Payments',
      'Savings',
      'Other',
      // Income categories
      'Salary',
      'Freelance',
      'Business',
      'Investment',
      'Rental',
      'Gift',
      'Bonus',
      'Commission',
      'Dividend',
      'Interest',
      'Refund'
    ]
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  date: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'Bank Transfer', 'Other'],
    default: 'Other'
  },
  location: {
    type: String,
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  receipt: {
    type: String, // URL to receipt image
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', null],
    default: null
  }
}, {
  timestamps: true
});

// Index for querying expenses by date range
expenseSchema.index({ user: 1, date: -1 });

// Index for category-based queries
expenseSchema.index({ user: 1, category: 1 });

// Static method to get user's total expenses for a given month
expenseSchema.statics.getMonthlyTotal = async function(userId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get user's total by type for a given month
expenseSchema.statics.getMonthlyTotalByType = async function(userId, month, year, type) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const result = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        type: type
      }
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$amount' }
      }
    }
  ]);

  return result.length > 0 ? result[0].total : 0;
};

// Static method to get expenses by category for a given month
expenseSchema.statics.getMonthlyCategoryTotals = async function(userId, month, year) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get transactions by category and type for a given month
expenseSchema.statics.getMonthlyCategoryTotalsByType = async function(userId, month, year, type) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        type: type
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get weekly stats (current week or by date)
expenseSchema.statics.getWeeklyStatsByType = async function(userId, weekStart, weekEnd, type) {
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: weekStart, $lte: weekEnd },
        type: type
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get yearly stats by type
expenseSchema.statics.getYearlyStatsByType = async function(userId, year, type) {
  const startDate = new Date(year, 0, 1);
  const endDate = new Date(year, 11, 31, 23, 59, 59, 999);
  return this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: startDate, $lte: endDate },
        type: type
      }
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Static method to get timeline data (grouped by day/week/month)
expenseSchema.statics.getTimeline = async function(userId, period, year, month, type) {
  let groupBy, match = { user: new mongoose.Types.ObjectId(userId), type };
  let startDate, endDate;
  if (period === 'year') {
    startDate = new Date(year, 0, 1);
    endDate = new Date(year, 11, 31, 23, 59, 59, 999);
    groupBy = { year: { $year: '$date' }, month: { $month: '$date' } };
  } else if (period === 'month') {
    startDate = new Date(year, month - 1, 1);
    endDate = new Date(year, month, 0, 23, 59, 59, 999);
    groupBy = { year: { $year: '$date' }, month: { $month: '$date' }, day: { $dayOfMonth: '$date' } };
  } else if (period === 'week') {
    // Assume weekStart and weekEnd passed as params (dates)
    startDate = new Date(year, month - 1, 1); // fallback
    endDate = new Date(year, month, 0, 23, 59, 59, 999); // fallback
    groupBy = { year: { $year: '$date' }, week: { $isoWeek: '$date' }, day: { $dayOfMonth: '$date' } };
  }
  match.date = { $gte: startDate, $lte: endDate };
  return this.aggregate([
    { $match: match },
    {
      $group: {
        _id: groupBy,
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);
};

const Expense = mongoose.model('Expense', expenseSchema);

module.exports = Expense;