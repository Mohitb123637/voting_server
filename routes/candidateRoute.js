const express = require('express');
const router = express.Router();
const { jwtAuthMiddleware, generateToken } = require('../jwt');
const Candidate = require('../models/candidate');
const User = require('../models/user');

// Helper function to check if the user is an admin
const checkAdminRole = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.role === 'admin';
  } catch (error) {
    return false;
  }
};

// Create a new candidate (Admin-only)
router.post('/', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      console.log('Admin role not found');
      return res.status(403).json({ message: 'User does not have admin role' });
    }
    const data = req.body;
    const newCandidate = new Candidate(data);
    const response = await newCandidate.save();
    console.log('Candidate data saved successfully');
    res.status(201).json({ response });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

// Update candidate (Admin-only)
router.put('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }
    const candidateId = req.params.candidateID;
    const updatedCandidateData = req.body;
    const response = await Candidate.findByIdAndUpdate(
      candidateId,
      updatedCandidateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!response) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    console.log('Candidate updated', response);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// Delete candidate (Admin-only)
router.delete('/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const isAdmin = await checkAdminRole(req.user.id);
    if (!isAdmin) {
      return res.status(403).json({ message: 'User does not have admin role' });
    }
    const candidateId = req.params.candidateID;
    const response = await Candidate.findByIdAndDelete(candidateId);
    if (!response) {
      return res.status(404).json({ message: 'Candidate not found' });
    }
    console.log('Candidate deleted', response);
    res.status(200).json({ message: 'Candidate deleted successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// Vote for a candidate (Users-only)
router.put('/vote/:candidateID', jwtAuthMiddleware, async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateID);
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isvoted) {
      return res.status(403).json({ message: 'User has already voted' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins cannot vote' });
    }
    console.log('Pushing vote for user:', user.id);

    // Update candidate's vote count
    candidate.votes.push({ user: user.id });
    candidate.voteCount++;
    await candidate.save();

    // Update user's voting status
    user.isvoted = true;
    await user.save();

    res.status(200).json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

// Get the vote count for candidates
router.get('/vote/count', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ voteCount: -1 }); // Sort by descending vote count
    const record = candidates.map((data) => ({
      party: data.party,
      voteCount: data.voteCount,
    }));
    res.status(200).json(record);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

router.get('/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find({});
    res.status(200).json(candidates);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
