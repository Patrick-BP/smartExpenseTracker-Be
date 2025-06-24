const cron = require('node-cron');
const { processRecurringTransactions } = require('./jobs/recurringJob');

// Only schedule cron jobs if not in test environment
if (process.env.NODE_ENV !== 'test') {
  // Run every hour at minute 0 (e.g., 1:00, 2:00, ...)
  cron.schedule('0 * * * *', async () => {
    try {
      console.log('[RecurringScheduler] Processing recurring transactions...');
      await processRecurringTransactions();
      console.log('[RecurringScheduler] Done.');
    } catch (err) {
      console.error('[RecurringScheduler] Error:', err);
    }
  });
}

