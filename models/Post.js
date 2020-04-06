const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const PostSchema = new Schema({
  // details of the post, including user, post content username (different from user which is the id) and user avatar
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },

  text: {
    type: String,
    required: true
  },

  // Putting the "name" and "avatar" of user in Post schema so that we can keep the posts (and name of user) after the user deletes his/her account. This way we can pull the user info from the post rather than the user profile

  name: {
    type: String
  },

  avatar: {
    type: String
  },

  // "likes" counter. each like has a user

  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
    }
  ],

  // Comments section. Each comment has user, text (comment content), name of user. his/her avatar, and date of comment
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      },
      text: {
        type: String,
        required: true
      },
      name: {
        type: String
      },
      avatar: {
        type: String
      },
      date: {
        type: Date,
        default: Date.now
      }
    }
  ],

  //Date of the post
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = Post = mongoose.model('posts', PostSchema);
