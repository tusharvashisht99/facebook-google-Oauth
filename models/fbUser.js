const { string } = require('@hapi/joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    uid: String,
    email: String,
    name: String,
    pic: String    
});

const fbUser = mongoose.model('fbUser',userSchema);
module.exports = fbUser;
