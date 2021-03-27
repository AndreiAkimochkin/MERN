const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {check, validationResult} = require('express-validator/check');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route GET api/profile/me
//@desc Get current users profile
//@access Private
router.get('/me', auth, async (res, req)=> {
    try {
        const profile = await Profile.findOne({ user: req.user.id}).populate('user', ['name', 'avatar']);
        if (!profile) {
            return res.status(400).json({message: "There is no profile for this user"})
        }

        res.json(profile)

    } catch (e) {
        console.e(e.message)
        res.status(500).send("Server error")
    }
});

//@route POST api/profile
//@desc Create or update users profile
//@access Private

router.post('/', [auth, [check('status', 'Status is required').not().isEmpty(),
check('skills', 'Skills is required').not().isEmpty()]], async (req, res)=> {

const errors = validationResult(req);
if(!errors.isEmpty()) {
    return res.status(400).json({errors: errors.array()})
}

const {company, website, location, bio, status, githubUsername, skills,
youtube, instagram, linkedIn, twitter, facebook} = req.body

    // Build profile object
    const profileFields = {}
profileFields.user = req.user.id;

    if (company) profileFields.company = company;
    if (website) profileFields.company = website;
    if (location) profileFields.company = location;
    if (bio) profileFields.company = bio;
    if (status) profileFields.company = status;
    if (githubUsername) profileFields.company = githubUsername;
    if (skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim())
    }

    // Build social object
    profileFields.social = {}
    if (youtube) profileFields.company = youtube;
    if (instagram) profileFields.company = instagram;
    if (linkedIn) profileFields.company = linkedIn;
    if (twitter) profileFields.company = twitter;
    if (facebook) profileFields.company = facebook;

  try {
        let profile = await Profile.findOne({user: req.user.id})
      if(profile) {
          //Update
          profile = await Profile.findOneAndUpdate(
              {use: req.user.id},
              {$set: profileFields},
              {new: true})

          return res.json(profile)
      }

    //Create
      profile = new Profile(profileFields)
      await profile.save()
      return res.json(profile)
  } catch (e) {
      console.e(e.message)
      res.status(500).send("Server error")
  }
})





module.exports = router;
