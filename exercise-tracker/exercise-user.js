const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    }
})

userSchema.virtual('exercises').get(async function() {
    return await require('./exercise').find({username: this.username}, {__v: 0, username: 0});
})

module.exports = mongoose.model('ExerciseUser', userSchema);