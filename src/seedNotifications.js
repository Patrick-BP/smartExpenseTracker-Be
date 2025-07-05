// Usage: node src/seedNotifications.js <userId>
const mongoose = require('mongoose');
const Notification = require('./models/Notification');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-expense-tracker';
const userId = process.argv[2];

if (!userId) {
  console.error('Usage: node src/seedNotifications.js <userId>');
  process.exit(1);
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  const notifications = [
    {
      user: userId,
      title: 'Welcome to Smart Expense Tracker!',
      message: 'This is your first notification.',
      date: new Date(),
      read: false
    },
    {
      user: userId,
      title: 'Recurring Payment Reminder',
      message: 'Your monthly rent is due soon.',
      date: new Date(Date.now() - 86400000), // 1 day ago
      read: false
    }
  ];
  await Notification.insertMany(notifications);
  console.log('Seeded notifications for user:', userId);
  await mongoose.disconnect();
}

seed();
