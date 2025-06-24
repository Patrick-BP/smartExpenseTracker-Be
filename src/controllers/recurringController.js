const RecurringTransaction = require('../models/RecurringTransaction');
const Expense = require('../models/Expense');

// Create a recurring transaction
async function createRecurring(req, res) {
  try {
    const data = { ...req.body, user: req.user._id };
    const recurring = await RecurringTransaction.create(data);
    res.status(201).json(recurring);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Get all recurring transactions for the user
async function getRecurring(req, res) {
  try {
    const recurring = await RecurringTransaction.find({ user: req.user._id });
    res.json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Update a recurring transaction
async function updateRecurring(req, res) {
  try {
    const updated = await RecurringTransaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// Delete a recurring transaction
async function deleteRecurring(req, res) {
  try {
    const deleted = await RecurringTransaction.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// (Optional) Get a single recurring transaction
async function getRecurringById(req, res) {
  try {
    const recurring = await RecurringTransaction.findOne({ _id: req.params.id, user: req.user._id });
    if (!recurring) return res.status(404).json({ error: 'Not found' });
    res.json(recurring);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

module.exports = {
  createRecurring,
  getRecurring,
  updateRecurring,
  deleteRecurring,
  getRecurringById
};
