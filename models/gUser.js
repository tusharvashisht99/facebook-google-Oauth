const mongoose = require('mongoose');

const userSchema = new mongoose.Schema ({
    uid: String,
    email: String,
    name: String,
    pic: String    
});

const gUser = mongoose.model('gUser',userSchema);
module.exports = gUser;
