const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user');
const Exercise = require('./models/exercise');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Endpoint - /api/users
// Route handler for '/api/users'
app
  .route('/api/users')
  .get(async (req, res) => {
    // Handler for GET request
    const result = await User.find({}).select({
      __v: 0,
      description: 0,
      duration: 0,
      date: 0,
    });

    console.log('users', result);
    if (result.length == 0) {
      res.json({ message: 'No data available' });
    } else {
      res.json(result);
    }
  })
  // Handler for POST request
  .post(async (req, res) => {
    const username = req.body.username;
    console.log('formData', req.body);
    const newUser = new User({
      username: username,
    });
    const result = await newUser.save();
    console.log('res:', result);
    res.json({ username: username, _id: result._id });
  });

// Endpoint - /api/users/:_id/exercises
app.post('/api/users/:_id/exercises', async (req, res) => {
  console.log('body:', req.body);
  const userId = req.params._id;

  // Find in user in database
  let user = await User.findById(userId);

  let dateStr = new Date(req.body.date);

  if (req.body.date == '' || dateStr == 'Invalid Date') {
    dateStr = new Date();
  }
  // if (dateStr == 'Invalid Date') {
  //   res.json({
  //     error: 'Invalid Date. Please enter valid date in yyyy-mm-dd format.',
  //   });
  // } else {
  const newExercise = new Exercise({
    userid: user._id,
    description: req.body.description,
    duration: req.body.duration,
    date: dateStr.toISOString(),
  });

  try {
    const savedData = await newExercise.save();
    res.json({
      username: user.username,
      description: savedData.description,
      duration: savedData.duration,
      date: new Date(savedData.date).toDateString(),
      _id: savedData.userid,
    });
  } catch (error) {
    res.json({ error: 'Error in updating data in database' });
    console.log('Error:', error);
  }
});

// Endpoint - /api/users/:_id/logs
app.get('/api/users/:_id/logs', async (req, res) => {
  const userId = req.params._id;

  const { from, to, limit } = req.query;
  console.log('from:', from);
  console.log('to:', to);
  const user = await User.findById(userId);

  if (user) {
    // Filter records
    let filter = {
      userid: user.id,
    };
    let queryDate = {};
    if (from) {
      queryDate['$gte'] =
        new Date(from).getFullYear() +
        '-' +
        String(new Date(from).getMonth() + 1).padStart(2, '0') +
        '-' +
        String(new Date(from).getDate()).padStart(2, '0') +
        'T00:00:00.000Z';
    }
    if (to) {
      queryDate['$lte'] =
        new Date(to).getFullYear() +
        '-' +
        String(new Date(to).getMonth() + 1).padStart(2, '0') +
        '-' +
        String(new Date(to).getDate()).padStart(2, '0') +
        'T23:59:59.999Z';
    }
    if (from && to) {
      filter.date = queryDate;
    }

    let records = await Exercise.find(filter).select({
      __v: 0,
      _id: 0,
      userid: 0,
    });

    if (limit) {
      records = records.slice(0, limit);
    }

    records = records.map((record) => {
      const formattedDate = new Date(record.date).toDateString();
      return { ...record.toObject(), date: formattedDate };
    });

    console.log('user::', records);
    res.json({
      _id: user._id,
      username: user.username,
      count: records.length,
      log: records,
    });
  } else {
    res.json({ message: 'No data available' });
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
