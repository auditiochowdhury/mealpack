const cloudinary = require("../middleware/cloudinary");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Favorite = require("../models/Favorite");
const User = require("../models/User");



module.exports = {
  getProfile: async (req, res) => {
    try {
      const posts = await Post.find({ user: req.user.id });
      res.render("profile.ejs", { posts: posts, user: req.user });
    } catch (err) {
      console.log(err);
    }
  },
  getFeed: async (req, res) => {
    try {
      //.lean() trims the fat and we get to work with just the js object.
      const posts = await Post.find().sort({ createdAt: "desc" }).lean();
      res.render("feed.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  getMyMeals: async (req, res) => {
    try {
      //.lean() trims the fat and we get to work with just the js object.
      const posts = await await Post.find({ user: req.user.id }).sort({ createdAt: "desc" }).lean();
      res.render("mymeals.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  
  getPost: async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      const comments = await Comment.find({post: req.params.id}).sort({ createdAt: "desc" }).lean();
      res.render("post.ejs", { post: post, user: req.user, comments: comments });
    } catch (err) {
      console.log(err);
    }
  },
  createPost: async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);

      await Post.create({
        meal: req.body.meal,
        ingredients: req.body.ingredients,
        image: result.secure_url,
        cloudinaryId: result.public_id,
        caption: req.body.caption,
        likes: 0,
        favorited: false,
        user: req.user.id,
      });
      console.log("Post has been added!");
      res.redirect("/profile");
    } catch (err) {
      console.log(err);
    }
  },
  likePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        { _id: req.params.id },
        {
          $inc: { likes: 1 },
        }
      );
      console.log("Likes +1");
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  // making a contoller for favorite a meal, its going to be the star next to heart
  favoritePost: async (req, res) => {
    try {
      await Post.findOneAndUpdate(
        //This code saved me, helps the server know which post to favorite, before it was only favoriting one specific post no matter what
        { _id: req.params.id },

        //stack overflow, code that can help me toggle boolean field for favorites
        [{$set: {favorited:{$eq:[false,"$favorited"]}}}])
      
      res.redirect(`/post/${req.params.id}`);
    } catch (err) {
      console.log(err);
    }
  },
  getFavorites: async (req, res) => {
    try {
      //.lean() trims the fat and we get to work with just the js object.
      //Wow. THIS Was the code i needed to add the favorited meal into the favorites.ejs. I dont even need a Favorites model
      // 
      const posts = await Post.find({ favorited: true }).sort({ createdAt: "desc" }).lean();
      res.render("favorites.ejs", { posts: posts });
    } catch (err) {
      console.log(err);
    }
  },
  deletePost: async (req, res) => {
    try {
      // Find post by id
      let post = await Post.findById({ _id: req.params.id });
      // Delete image from cloudinary
      await cloudinary.uploader.destroy(post.cloudinaryId);
      // Delete post from db
      await Post.remove({ _id: req.params.id });
      console.log("Deleted Post");
      res.redirect("/profile");
    } catch (err) {
      res.redirect("/profile");
    }
  },
};
