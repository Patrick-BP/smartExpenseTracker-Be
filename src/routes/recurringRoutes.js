const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const recurringController = require('../controllers/recurringController');

// CRUD for recurring transactions
router.post('/', auth, recurringController.createRecurring);
router.get('/', auth, recurringController.getRecurring);
router.get('/:id', auth, recurringController.getRecurringById);
router.put('/:id', auth, recurringController.updateRecurring);
router.delete('/:id', auth, recurringController.deleteRecurring);

module.exports = router;
