const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { jwtAuthMiddleware, generateToken } = require('../jwt');

router.post('/signup', async (req, res) => {
  try {
    const data = req.body;

    // check if role is admin
    if (data.role === 'admin') {
      const existingAdmin = await User.findOne({ role: 'admin' });
      if (existingAdmin) {
        return res.status(409).json({ message: 'Admin already exists' });
      }
    }
    const newUser = new User(data);
    const response = await newUser.save();
    console.log('Data is saved successfully');

    const payload = {
      id: response.id,
    };

    console.log('Payload is saved successfully', JSON.stringify(payload)); // Corrected `json.stringify` to `JSON.stringify`

    const token = generateToken(payload);
    console.log('Token is saved successfully');

    res.status(201).json({ response: response, token: token });
  } catch (error) {
    console.error('Error in signup', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { adharCardNumber, password } = req.body;
    const user = await User.findOne({ adharCardNumber: adharCardNumber });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const payload = {
      id: user.id,
    };
    const token = generateToken(payload);
    res.json({ token: token, user: user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/profile', jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = await req.user;
    console.log(userData);
    const userId = userData.id;
    const user = await User.findById(userId);
    res.status(200).json({ user: user });
  } catch (error) {
    console.error('Error in getting user profile', error);
    res.status(500).json({ error: error.message });
  }
});

// password change

router.put('/profile/password', jwtAuthMiddleware, async (req, res) => {
  try {
    const userData = await req.user;
    const userId = userData.id;
    const { currentPassword, newPassword } = req.body;
    // Find the user
    const user = await User.findById(userId);
    // Check if the current password is correct
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ error: 'Invalid current password' });
    }
    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: 'Password updated' });
    console.log('Password updated');
  } catch (error) {
    console.error('Error in changing password', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const user = await User.find({});
    res.status(200).json(user);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/logout', (req, res) => {
  // Simply respond to indicate the user has logged out
  res.status(200).json({ message: 'Logged out successfully' });
});

module.exports = router;
