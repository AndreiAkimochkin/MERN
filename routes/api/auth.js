const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../../models/User');
const {check, validationResult} = require('express-validator/check');
const jwt = require('jsonwebtoken');
const config = require('config');
const bcrypt = require('bcryptjs');


//@route GET api/auth
//@desc Tests route
//@access Public
router.get('/', auth, async (res, req)=> {
    try {
       const user =  await User.findById(req.user.id).select('-password')
        res.json(user)
    } catch (e) {
        console.log(e.message)
        res.status(500).send('Server error')
    }
});


//@route POST api/auth
//@desc Authenticate user & get token
//@access Public
router.post('/', [
        check('email', 'Please include a vaid email').isEmail(),
        check('password', 'Password is required').exists()

    ],
    async (res, req)=> {
        const errors = validationResult(req)
        if(!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()})
        }

        const {password, email} = req.body;

        try {
            // See if user exist
            let user = await User.findOne({email})

            if (!user) {
                return res.status(400).json({errors: [{ message: "Invalid Credentials"}]});
            }
            //Get users gravatar
            const avatar = gravatar.url(email, {
                s: '200', r: "pg", d: 'mm'
            })
            user = new User({
                name, email, avatar, password
            })

            //Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt)

            await user.save();

          const isMatch = await bcrypt.compare(password, user.password);

          if(!isMatch) {
              return res.status(400).json({errors: [{ message: "Invalid Credentials"}]});
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
            console.log(e.message);
            res.status(500).send('Server error')
        }


        res.send("User route")
    });

module.exports = router;
