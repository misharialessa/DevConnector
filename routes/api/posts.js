const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route    POST api/posts
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

// @route    PUT api/posts/like/:id (PUT because we are technically updating a post)
// @desc     Like a post
// @access   Private (need to be logged in to like a post)

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has already been liked by the logged in user (each user has one like only per post)
    // Step 1: "Filter" through the likes array for that post. filter returns the "elements" of the likes array that matche logic in the function passed in (in this case, the user.id)
    // Step 1 Note: need to convert like.user to string since it is an ObjectId whereas req.user.id is a String
    // Step 2: if the result of the filter is positive, that means the user.id exists in the likes array. So user already liked the post
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ msg: 'You already liked this post!' });
    }

    // post not liked, so add a like to the likes array. Add the user to the beginning of the likes array (by using unshift())

    post.likes.unshift({ user: req.user.id });

    // Save the like to the database
    await post.save();

    // respond with the "likes" count of the post. this will help for the front end when we update the likes after someone likes a post

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    PUT api/posts/unlike/:id (PUT because we are technically updating a post)
// @desc     Remove Like from a post
// @access   Private (need to be logged in to like a post)

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // Check if the post has  been liked by the logged in user (if not, user cannot unlike the post)

    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ msg: 'You have not liked this post!' });
    }

    // post liked, so remove the like

    // First "map" through the "Likes" array to get the "position" of the current user unliking the post, then return the index of that user within the likes arrays

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);

    // Save the like to the database
    await post.save();

    // respond with the "likes" count of the post. this will help for the front end when we update the likes after someone likes a post

    res.json(post.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  '/comment/:id',
  [auth, [check('text', 'Text is required!').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      //Creating a user variable so we can pull the name and avatar from database (not necessary here but important when we pull the post and need the user info)
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server Error!');
    }
  }
);

// @route    DELETE api/posts/comment/:id/:comment_id
// @desc     Delete comment from a post
// @access   Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    // pull put comment

    const comment = post.comments.find(
      (comment) => comment.id == req.params.comment_id
    );

    //Make sure comment exists

    if (!comment) {
      return res.status(404).json({ msg: 'Comment does not exist!' });
    }

    //Check if the logged-in user (who is trying to delete the comment) is the one who wrote that comment

    if (comment.user.toString() !== req.user.id) {
      return res
        .status(401)
        .json({ msg: 'User not authorized to delete the comment!' });
    }

    // Get remove index

    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);

    await post.save();
    res.json(post.comments);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error!');
  }
});

module.exports = router;
