// Init
const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, () => console.log('connected'));
const urlModel = require('./url');
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

app.post('/api/shorturl', async (req, res) => {
  const {url} = req.body;
  if (!/^(https?:\/\/)/.test(url)) {
    res.json({error: 'invalid url'});
    return
  }
  const dns = require('dns');
  const host = url.split('//')[2];
  let error = false;
  dns.lookup(host, {all: true}, async (err, addresses) => {
    if (err) {
      error = true;
      res.json({error: 'invalid url'});
      console.error(err.message)
      return
    }
    try {
      let cached = await urlModel.where({url: url});
      if (cached.length > 0) {
        cached = cached[0];
        res.json({original_url: url, short_url: cached.short})
        return
      }
      const count = await urlModel.countDocuments({});
      const index = count + 1;
      await urlModel.create({url: url, short: index});
      res.json({original_url: url, short_url: index})  
    }
    catch (e) {
      console.error(e);
    }
  })
})

app.get('/api/shorturl/:index', async (req, res) => {
  const {index} = req.params;
  if (!index || isNaN(Number(index))) {
    res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    return
  }
  const urlCouple = await urlModel.findOne({short: Number(index)});
  if (!urlCouple) {
    res.redirect('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
    return
  }
  res.redirect(urlCouple.url);
})

const listener = app.listen(process.env.PORT || 3000, () => {
    console.log('Listening on port ' + listener.address().port)
})