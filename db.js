const mongoose = require('mongoose');
require('dotenv').config();

const mongoUrl = process.env.DB_URL;

mongoose
  .connect(mongoUrl)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.log('MongoDB connection error:', error));

const db = mongoose.connection;

db.on('error', (error) => {
  console.log('MongoDB error:', error);
});
