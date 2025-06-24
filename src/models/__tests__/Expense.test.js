const mongoose = require('mongoose');
const Expense = require('../Expense');
const User = require('../User');

describe('Expense Model Test', () => {
  let user;

  beforeAll(async () => {
    await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    // Create a test user
    user = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Expense.deleteMany({});
  });

  it('should create & save expense successfully', async () => {
    const validExpense = new Expense({
      user: user._id,
      amount: 100,
      category: 'Food',
      description: 'Lunch',
      date: new Date(),
      paymentMethod: 'Cash'
    });

    const savedExpense = await validExpense.save();
    
    expect(savedExpense._id).toBeDefined();
    expect(savedExpense.amount).toBe(validExpense.amount);
    expect(savedExpense.category).toBe(validExpense.category);
    expect(savedExpense.user.toString()).toBe(user._id.toString());
  });

  it('should fail to save expense with invalid category', async () => {
    const expenseWithInvalidCategory = new Expense({
      user: user._id,
      amount: 100,
      category: 'InvalidCategory',
      description: 'Test expense',
      date: new Date()
    });

    let err;
    try {
      await expenseWithInvalidCategory.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.category).toBeDefined();
  });

  it('should fail to save expense with negative amount', async () => {
    const expenseWithNegativeAmount = new Expense({
      user: user._id,
      amount: -100,
      category: 'Food',
      description: 'Test expense',
      date: new Date()
    });

    let err;
    try {
      await expenseWithNegativeAmount.save();
    } catch (error) {
      err = error;
    }

    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.amount).toBeDefined();
  });

  it('should get monthly total correctly', async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Create test expenses
    await Expense.create([
      {
        user: user._id,
        amount: 100,
        category: 'Food',
        date: currentDate
      },
      {
        user: user._id,
        amount: 200,
        category: 'Transportation',
        date: currentDate
      }
    ]);

    const monthlyTotal = await Expense.getMonthlyTotal(user._id, currentMonth, currentYear);
    expect(monthlyTotal).toBe(300);
  });

  it('should get monthly category totals correctly', async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    // Create test expenses
    await Expense.create([
      {
        user: user._id,
        amount: 100,
        category: 'Food',
        date: currentDate
      },
      {
        user: user._id,
        amount: 150,
        category: 'Food',
        date: currentDate
      },
      {
        user: user._id,
        amount: 200,
        category: 'Transportation',
        date: currentDate
      }
    ]);

    const categoryTotals = await Expense.getMonthlyCategoryTotals(user._id, currentMonth, currentYear);
    
    expect(categoryTotals).toHaveLength(2);
    
    const foodTotal = categoryTotals.find(cat => cat._id === 'Food');
    expect(foodTotal.total).toBe(250);
    expect(foodTotal.count).toBe(2);

    const transportTotal = categoryTotals.find(cat => cat._id === 'Transportation');
    expect(transportTotal.total).toBe(200);
    expect(transportTotal.count).toBe(1);
  });
});