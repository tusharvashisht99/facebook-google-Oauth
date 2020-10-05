const express = require('express');
const router = express.Router();
const Joi = require('@hapi/joi');
const data = require('../models/user');
const bycrpt = require('bcryptjs');
const passport = require('passport');

const {
    response,
    Router
} = require('express');

//login get
router.get('/login', (req, res) => {
    res.render("login");
})

// //login post
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/users/login',
        successRedirect: '/dashboard'
    })(req,res,next)
})
// router.post('/login',async (req,res)=>{
//     const { email , password} = req.body;
//      const errors = [];
//     //checking email in db
//     const user = await data.findOne({email:email});
//     if(!user){errors.push({msg:'email not exist/ incorrect email'})}
//     //checking password
//     if(user){
//     const pwd = await bycrpt.compare(password,user.password)
//     if(!pwd){errors.push({msg:'Incorrect password'})}
//     }
//     if(errors.length>0){
//         res.render('login',{errors})
//     }else{
//         res.render('dashboard');
//     }
// })


//register
router.get('/register', (req, res) => {
    res.render("register");
})

//using @HAPI/JOI V14 for validation
const schema = {
    name: Joi.string().min(5).required(),
    email: Joi.string().min(8).required().email(),
    password: Joi.string().min(6).required(),
    password2: Joi.string().min(6).required()
}
//registerPOST
router.post('/register', async (req, res) => {
    const errors = [];
    const {
        name,
        email,
        password,
        password2
    } = req.body;
    const {
        error
    } = Joi.validate(req.body, schema);
    if (error) {
        errors.push({
            msg: error.details[0].message
        })
    }
    //checking both passwords
    if (password !== password2) {
        errors.push({
            msg: 'password dont match'
        })
    }

    //checking is user already exist
    const emailCheck = await data.findOne({
        email: email
    });
    if (emailCheck) {
        errors.push({
            msg: 'email already exists'
        })
    }
    if (errors.length > 0) {
        res.render('register', {
            errors,
            name,
            email,
            password,
            password2
        });
    } else {
        //  using bcrypt for encrypting password
        const salt = await bycrpt.genSalt(10);
        const pwd = await bycrpt.hash(req.body.password, salt);


        const items = await new data({
            name: req.body.name,
            email: req.body.email,
            password: pwd
        })

        const new_data = await items.save();
        res.redirect('/users/login');
    }
})


module.exports = router;