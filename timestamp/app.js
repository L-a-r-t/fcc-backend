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

app.get("/api/:date?", (req, res) => {
    const {date} = req.params;
    if (!date) {
      res.json({unix: Date.now(), utc: new Date().toUTCString()})
      return
    }
    const isUnix = !isNaN(Number(date)) && new Date(date);
    const isUtc = !isNaN(Date.parse(date));
    if (isUnix) {
      res.json({unix: date, utc: new Date(date).toUTCString()})
      return
    }
    if (isUtc) {
      res.json({unix: Date.parse(date), utc: new Date(date).toUTCString()})
      return 
    }
    res.json({error: 'invalid date'});
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + listener.address().port)
})