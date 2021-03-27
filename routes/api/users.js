const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const {check, validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config')

const User = require('../../models/User');

//@route POST api/users
//@desc Register user
//@access Public
router.post('/', [
    check('name', "Name is required").not().isEmpty(),
    check('email', 'Please include a vaid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength(6)

],
    async (res, req)=> {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()})
    }

    const {name, password, email} = req.body;

    try {
        // See if user exist
        let user = await User.findOne({email})

        if (user) {
            return res.status(400).json({errors: [{ message: "User already exist"}]});
        }



        //Return jsonweboken
       const payload = {
           user: {
               id: user.id
           }
       }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            {expiresIn: '1h'},
            (err, token)=> {
                if (err) throw err;
                res.json({token})
            })
    } catch (e) {
        console.e(e.message);
        res.status(500).send('Server error')
    }


    res.send("User route")
});


module.exports = router;
