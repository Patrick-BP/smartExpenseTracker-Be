const RecurringTransaction = require('../models/RecurringTransaction');
const Expense = require('../models/Expense');

/**
 * Calculate the next occurrence date for a recurring transaction.
 * @param {Date} current - The current occurrence.
 * @param {String} frequency - 'daily' | 'weekly' | 'monthly' | 'yearly'.
 * @param {Number} interval - Interval between occurrences.
 * @returns {Date}
 */
function getNextOccurrence(current, frequency, interval) {
  const date = new Date(current);
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + interval);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7 * interval);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + interval);
      break;
    case 'yearly':
      date.setFullYear(date.getFullYear() + interval);
      break;
    default:
      throw new Error('Invalid frequency');
  }
  return date;
}

/**
 * Generate due transactions for all active recurring rules.
 * Should be called periodically (e.g., every hour).
 */
async function processRecurringTransactions() {
  const now = new Date();
  // Find all active recurring transactions due for generation
  const due = await RecurringTransaction.find({
    active: true,
    nextOccurrence: { $lte: now },
    $or: [
      { endDate: null },
      { endDate: { $gte: now } }
    ]
  });

  for (const rule of due) {
    // Create an Expense (or Income) transaction
    await Expense.create({
      user: rule.user,
      type: rule.type,
      amount: rule.amount,
      category: rule.category,
      description: rule.description,
      paymentMethod: rule.paymentMethod,
      date: rule.nextOccurrence
    });
    // Update lastGenerated and nextOccurrence
    rule.lastGenerated = rule.nextOccurrence;
    rule.nextOccurrence = getNextOccurrence(rule.nextOccurrence, rule.frequency, rule.interval);
    await rule.save();
  }
}

module.exports = {
  processRecurringTransactions
};
