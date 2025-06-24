const express = require('express');
const axios = require('axios');
const router = express.Router();

// Helper to build prompt for AI
function buildPrompt(userData = {}, recentExpenses = {}) {
  const food = typeof recentExpenses.food === 'number' ? recentExpenses.food : 0;
  const foodBudget = typeof userData.foodBudget === 'number' ? userData.foodBudget : 0;
  const total = typeof recentExpenses.total === 'number' ? recentExpenses.total : 0;
  return `Give financial advice based on this:\n
    - User has spent $${food} on food\n    - Budget for food is $${foodBudget}\n    - Total expenses: $${total}\n  `;
}

// POST /api/coach
router.post('/', async (req, res) => {
  try {
    const { userData = {}, recentExpenses = {} } = req.body;
    // Validate required fields
    if (
      typeof userData.foodBudget === 'undefined' ||
      typeof recentExpenses.food === 'undefined' ||
      typeof recentExpenses.total === 'undefined'
    ) {
      return res.status(400).json({ error: 'Missing required userData or recentExpenses fields.' });
    }
    const prompt = buildPrompt(userData, recentExpenses);

    // Ensure API key exists
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured.' });
    }
    // Allow for custom API base URL (optional)
    const apiBase = process.env.OPENAI_API_BASE_URL || 'https://api.openai.com/v1';

    const response = await axios.post(
      `${apiBase}/chat/completions`,
      {
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful financial advisor.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: 180,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json(response.data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI response failed' });
  }
});

module.exports = router;
