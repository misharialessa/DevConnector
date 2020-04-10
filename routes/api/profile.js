const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const Post = require('../../models/Post');

const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/profile/me
// @desc     Get current user's profile
// @access   Private

router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res
        .status(400)
        .json({ msg: 'There is no profile for this user!' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    POST api/profile/
// @desc     Create or update user profile
// @access   Private

router.post(
  '/',
  [
    auth,
    [
      check('status', 'Status is required!').not().isEmpty(),
      check('skills', 'Skills are required!').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    } = req.body;

    // Build profile object

    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(',').map((skill) => skill.trim()); // trim() is just to take care of empty spaces after and before the commas
    }

    //Build "social" object. We have to initialize "social" or else we will get an error that cant find "youtube" of "undefined"

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (linkedin) profileFields.social.linkedin = linkedin;
    if (instagram) profileFields.social.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });
      if (profile) {
        //Update to add profile to user
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );

        return res.json(profile);
      }

      // profile not found, create one instead!

      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);

// @route    GET api/profile
// @desc     Get ALL profiles
// @access   Public

router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find().populate('user', ['name', 'avatar']);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    GET api/profile/user/:user_id
// @desc     Get SPECIFIC User profile by user id
// @access   Public

router.get('/user/:user_id', async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id
    }).populate('user', ['name', 'avatar']);

    if (!profile) {
      return res.status(400).json({ msg: 'Profile not found!' });
    }
    res.json(profile);
  } catch (err) {
    console.error(err.message);

    if (err.name == 'CastError') {
      return res.status(400).json({ msg: 'Profile not found! Server' });
    }
    res.status(500).send('Server Error!');
  }
});

// @route    DELETING api/profile
// @desc     Delete profile, user & posts
// @access   Private

router.delete('/', auth, async (req, res) => {
  try {
    //Remove user's posts
    await Post.deleteMany({ user: req.user.id });

    //Remove profile

    await Profile.findOneAndRemove({ user: req.user.id });

    //Remove user
    await User.findOneAndRemove({ _id: req.user.id });

    res.json({ msg: 'User Deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    PUT api/profile/experience
// @desc     Add profile experience
// @access   Private

router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Title is required!').not().isEmpty(),
      check('company', 'Company is required!').not().isEmpty(),
      check('from', 'From date is required!').not().isEmpty()
    ]
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    } = req.body;

    const newExp = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    // the above is the same as doing "const newExp = {title: title, company: company.....}" (I think because of the similar order we are assigning the variabkes)

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.experience.unshift(newExp); // unshift() pushes the argument to the beginning of the array while push() pushes the argument to the end of the array

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/experience/:exp_id
// @desc     Delete  experience from profile
// @access   Private

router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the remove index for the specific experience

    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private

router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School is required!').not().isEmpty(),
      check('degree', 'Degree is required!').not().isEmpty(),
      check('fieldofstudy', 'Field of study is required!').not().isEmpty(),
      check('from', 'From date is required!').not().isEmpty()
    ]
  ],

  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    } = req.body;

    const newEdu = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    // the above is the same as doing "const newEdu = {school: school, degree: degree.....}" (I think because of the similar order we are assigning the variables)

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(newEdu); // unshift() pushes the argument to the beginning of the array while push() pushes the argument to the end of the array

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error');
    }
  }
);

// @route    DELETE api/profile/education/:edu_id
// @desc     Delete  education from profile
// @access   Private

router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    // Get the remove index for the specific experience

    const removeIndex = profile.education
      .map((item) => item.id)
      .indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);
    await profile.save();
    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    GET api/profile/github/:username
// @desc     Get user repos from Github
// @access   Public

router.get('/github/:username', (req, res) => {
  try {
    //setting the options for the request we need to send to Github
    const options = {
      uri: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    // sending the request and handling the errors
    request(options, (error, response, body) => {
      if (error) console.error(error);
      if (response.statusCode !== 200) {
        return res.status(400).json({ msg: 'No Github profile found!' });
      }

      res.json(JSON.parse(body));
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

module.exports = router;
