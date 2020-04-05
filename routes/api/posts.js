const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    GET api/posts
// @desc     Create a post
// @access   Private
router.post(
  '/',
  [auth, [check('text', 'Text is required!').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //Creating a user variable so we can pull the name and avatar from database (not necessary here but important when we pull the post and need the user info)
      const user = await User.findById(req.user.id).select('-password');

      // text and user are pulled from the "req", but name and avatar are pulled from database (using user.name and user.avatar). name and avatar are stored in Posts schema so that when a user deletes his/her account we can still pull the user info

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);

// @route    GET api/posts
// @desc     Get ALL posts
// @access   Private (getting posts needs an account, so it is private, hence needs authentication)

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); // getting posts from most recent to oldest (hence the sort({date: -1}) )
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    GET api/posts/:id
// @desc     Get post by ID
// @access   Private (getting posts needs an account, so it is private, hence needs authentication)

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // getting posts from most recent to oldest (hence the sort({date: -1}) )

    //Checking if there is a post with the given id

    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    res.json(post);
  } catch (err) {
    console.error(err.message);

    if (err.name == 'CastError') {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    res.status(500).send('Server Error!');
  }
});

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private (getting posts needs an account, so it is private, hence needs authentication)

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id); // getting posts from most recent to oldest (hence the sort({date: -1}) )

    //Checking if there is a post with the given id

    if (!post) {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    //Check if user deleting the post is the owner of the post. Using "toString()" because post.user is ObjectId type and req.user.id is a String type

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    res.json({ msg: 'Post removed!' });
  } catch (err) {
    console.error(err.message);

    if (err.name == 'CastError') {
      return res.status(404).json({ msg: 'Post not found!' });
    }

    res.status(500).send('Server Error!');
  }
});

module.exports = router;
