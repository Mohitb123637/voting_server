const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const UserInteraction = require('../models/ai');
const { jwtAuthMiddleware } = require('../jwt');
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const generate = async (prompt) => {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.log('Error generating content:', error);
    throw error;
  }
};

router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const question = req.body.question;
    if (!question) {
      return res.status(400).send({ error: 'Question is required' });
    }
    const result = await generate(question);
    const userInteraction = new UserInteraction({
      userId: req.user.id,
      question: question,
      aiResponse: result,
    });
    await userInteraction.save();
    res.send({ result: result });
  } catch (error) {
    console.error('Error in generating AI response', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/all', jwtAuthMiddleware, async (req, res) => {
  try {
    const interactions = await UserInteraction.find({ userId: req.user.id });
    res.send(interactions);
  } catch (error) {
    console.error('Error fetching chat data', error);
    res.status(500).json({ error: error.message });
  }
});
