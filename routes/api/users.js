const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

//importing User model. The "../../" means going two folders up
const User = require('../../models/User');

// @route    POST api/users
// @desc     Register User
// @access   Public

router.post(
  '/',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check(
      'password',
      'Please enter a password with 5 or more characters'
    ).isLength({ min: 5 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // using destructuring to pull response's body information in one array for convenience
    // We dont have errors in the info sent, now we check if user (to be created) already exists

    const { name, email, password } = req.body;

    try {
      // Check if user exists

      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: 'User already exists' }] });
      }

      // Get user gravatar .. user doesnt exist, so we are creating a new user

      const avatar = gravatar.url(email, { s: '200', r: 'pg', d: 'mm' });
      user = new User({ name, email, avatar, password });

      // Encrypt password

      const salt = await bcrypt.genSalt(10); // 10 is an encryption input to indicate level of encryption

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken .. this is to keep the user logged in after successful registration
      // Everytime a user logs in, we give him/her a login token that expires in some time (here it is 360000 milliseconds)

      const payload = {
        user: { id: user.id },
      };

      jwt.sign(
        payload,
        config.get('jwtSecret'),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

module.exports = router;
