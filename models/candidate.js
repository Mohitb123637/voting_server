const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  party: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  profileImage: {
    type: String,
    default:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeOlwb6YnVU55H4BNqtLm7T8b7thI-HiQBrg&s',
  },
  votes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      votedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voteCount: {
    type: Number,
    default: 0,
  },
});

const Candidate = mongoose.model('Candidate', candidateSchema);
module.exports = Candidate;
