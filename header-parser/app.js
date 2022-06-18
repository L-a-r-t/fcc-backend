// Init
const express = require('express');
const app = express();

// CORS
const cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));

// Public
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.get('/api/whoami', (req, res) => {
  res.json({language: req.headers['accept-language'], ipaddress: req.ip, software: req.headers['user-agent']})
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + listener.address().port)
})