var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

/* GET home page. */
//一定要寫這段
router.get('/', function(req, res) {
  	res.render('index', { title: 'Express' });
  	Post.find(function(err, posts){
		if (err) { return next(err); }
		console.log('posts: ' + posts);
	});
});

router.get('/posts', function(req, res, next) {
	Post.find(function(err, posts){
		if (err) { return next(err); }
		// console.log('posts: ' + posts);
		res.json(posts);
	});
});

router.post('/posts', function(req, res, next) {
	var post = new Post(req.body);
	post.save(function(err, post){
		if (err){ return next(err); }
		res.json(post);
	});
});

router.param('post', function(req, res, next, id){
	var query = Post.findById(id);
	console.log('param post: ' + query);
	query.exec(function(err, post){
		if (err){ return next(err); }
		if (!post){ return next(new Error("cant't find post")); }

		req.post = post;
		return next();
	});
});

router.get('/posts/:post', function(req, res){
	console.log('get /posts/post: ' + req.post)
	req.post.populate('comments', function(err, post){
		res.json(req.post);
	});
});

router.put('/posts/:post/upvote', function(req, res, next) {
	console.log('put upvote req: ' + req.post);
	req.post.upvote(function(err, post){
		console.log('upvote post: ' + post);
		if (err) { 
			return next(err); 
		}
		
		res.json(post);
	});
});

router.post('/posts/:post/comments', function(req, res, next){
	var comment = new Comment(req.body);
	comment.post = req.post;

	comment.save(function(err, comment){
		if (err){ return next(err); }

		req.post.comments.push(comment);
		req.post.save(function(err, post) {
			if (err){ return next(err); }
			res.json(comment);
		});
	});

});

router.param('comment', function(req, res, next, id){
	var query = Comment.findById(id);
	console.log('param comment: ' + query);
	query.exec(function(err, comment){
		if (err){ return next(err); }
		if (!comment){ return next(new Error("cant't find post")); }

		req.comment = comment;
		return next();
	});
});

router.put('/posts/:post/comments/:comment/upvote', function(req, res, next){
	// console.log('router to upvote comment: ' + req.post.comments);
	// console.log('router to upvote comment: ' + JSON.stringify(req.body));
	console.log('router to upvote comment: ' + req.comment);
	req.comment.upvote(function(err, comment){
		if (err) { return next(err); }
		res.json(comment);
	});
});

module.exports = router;
