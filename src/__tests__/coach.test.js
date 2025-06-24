const request = require('supertest');
const nock = require('nock');
const app = require('../server');

describe('POST /api/coach', () => {
  beforeEach(() => {
    nock('https://api.openai.com')
      .post('/v1/chat/completions')
      .reply(200, {
        choices: [
          {
            message: {
              content: 'This is a mock AI response.'
            }
          }
        ]
      });
  });
  it('should return AI advice for valid user data', async () => {
    // Use mock data to avoid hitting the real OpenAI API in CI
    const userData = {
      foodBudget: 300
    };
    const recentExpenses = {
      food: 120,
      total: 800
    };

    // If you want to mock OpenAI API, use nock or similar here
    const res = await request(app)
      .post('/api/coach')
      .send({ userData, recentExpenses });
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('choices');
    expect(Array.isArray(res.body.choices)).toBe(true);
    expect(res.body.choices[0]).toHaveProperty('message');
    expect(res.body.choices[0].message).toHaveProperty('content');
  });

  it('should handle missing data gracefully', async () => {
    const res = await request(app)
      .post('/api/coach')
      .send({});
    expect([400, 500]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('error');
  });
});
