const express = require('express');
const app = express();
const db = require('./db.js');
const cors = require('cors');
require('dotenv').config();
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 5000;

const userRoutes = require('./routes/userRoutes.js');
const candidateRoutes = require('./routes/candidateRoute.js');
const aiRoutes = require('./routes/AiRoute.js');

app.use('/user', userRoutes);
app.use('/candidate', candidateRoutes);
app.use('/ai', aiRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Voting');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
