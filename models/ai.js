const mongoose = require('mongoose');

// Check if the model already exists
const UserInteraction =
  mongoose.models.UserInteraction ||
  mongoose.model(
    'UserInteraction',
    new mongoose.Schema({
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      question: {
        type: String,
        required: true,
      },
      aiResponse: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
    })
  );

module.exports = UserInteraction;
