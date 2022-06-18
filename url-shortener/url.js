const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    short: {
        type: Number,
        required: true
    }, 
  })
module.exports = mongoose.model('URL', urlSchema);