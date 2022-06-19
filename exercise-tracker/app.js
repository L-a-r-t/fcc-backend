// Init
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, () => console.log('connected'));
const users = require('./exercise-user');
const exercise = require('./exercise');
const parser = require('body-parser');
const app = express();

// Base middleware
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));
app.use(express.static('public'));
app.use(parser.urlencoded({extended: false}));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
})

app.get('/api/users', async (req, res) => {
  const userArray = await users.find({}, 'username _id');
  res.send(userArray);
})

app.post('/api/users', async (req, res) => {
  const {username} = req.body;
  if (!username) {
    const userArray = await users.find();
    res.send(userArray);
    return
  }
  const cachedUser = await users.findOne({username: username}, 'username _id');
  if (cachedUser) {
    res.json(cachedUser);
    return
  }
  const newUser = await users.create({
    username: username
  })
  res.json({
    username: newUser.username,
    _id: newUser._id,
  });
})

app.post('/api/users/:_id/exercises', async (req, res) => {
  const {_id} = req.params;
  let {description, duration, date} = req.body;
  if (date) {
    date = new Date(date).toDateString()
    if (date == 'Invalid Date') {
      res.status(400).send("Please provide a date following the yyyy-mm-dd format");
      return
    }
  }
  else date = new Date().toDateString();
  if (!description || !duration) {
    res.status(400).send("Please provide a description and a duration");
    return
  }
  if (isNaN(Number(duration))) {
    res.status(400).send("Please provide a number for the duration");
    return
  }
  const user = await users.findById(_id);
  if (!user) {
    res.status(400).send("Provided ID doesn't match any user");
    return
  }
  await exercise.create({
    username: user.username,
    description: description,
    duration: Number(duration),
    date: date,
  })
  res.json({
    username: user.username,
    description: description,
    duration: duration,
    date: date,
  })
})

app.get('/api/users/:_id/logs', async (req, res) => {
  let {from, to, limit} = req.query;
  if (from && (isNaN(Date.parse(from)) || from.length != 10)) {
    res.status(400).send("Please provide 'from' following the yyyy-mm-dd format");
    return
  }
  if (to && isNaN(Date.parse(to) || to.length != 10)) {
    res.status(400).send("Please provide 'to' following the yyyy-mm-dd format");
    return
  }
  if (limit && isNaN(Number(limit))) {
    res.status(400).send("Please provide 'limit' as a valid number");
    return
  }
  const {_id} = req.params;
  const user = await users.findById(_id);
  if (!user) {
    res.status(400).send("Provided ID doesn't match any user");
    return
  }
  const exercices = await user.exercises;
  res.json({
    username: user.username,
    count: exercices.length,
    log: exercices.map((ex) => {
      return {
        description: ex.description,
        duration: Number(ex.duration),
        date: ex.date,
      }
    }).filter((ex) => from ? new Date(ex.date) > new Date(from) : true)
      .filter((ex) => to ? new Date(ex.date) < new Date(to) : true)
      .slice(0, limit ? Number(limit) : exercices.length),
  })
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Listening on port ' + listener.address().port)
})