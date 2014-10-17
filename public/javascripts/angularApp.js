angular.module('flapperNews', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider', function($stateProvider, $urlRouterProvider){
	$stateProvider
	  .state('home', {
	  	resolve: {
	  		postPromise: ['posts', function(posts){
	  			return posts.getAll();
	  		}]
	  	},
		url: '/home',
		templateUrl: '/home.html',
		controller: 'MainCtrl'
	  })
	  .state('posts', {
	  	resolve: {
	  		post: ['$stateParams', 'posts', function($stateParams, posts){
	  			return posts.get($stateParams.id);
	  		}]
	  	},
	  	url: '/posts/{id}',
	  	templateUrl: '/posts.html',
	  	controller: 'PostsCtrl'
	  });

	$urlRouterProvider.otherwise('home');
}])
.factory('posts', ['$http', function($http){
	//service body
	var o = {
		posts: []
	};
	o.getAll = function() {
		return $http.get('/posts').success(function(data){
			angular.copy(data, o.posts);
		});
	};
	o.create = function(post) {
		return $http.post('/posts', post),success(function(data){
			o.posts.push(data);
		});
	};
	o.upvote = function(post) {
		return $http.put('/posts/' + post._id + '/upvote')
		.success(function(data){
			post.upvotes += 1;
		});
	};
	o.get = function(id) {
		return $http.get('/posts/' + id).then(function(res){
			return res.data
		});
	}
	o.addComment = function(id, comment) {
		return $http.post('/posts/' + id + '/comments', comment);
	};
	o.upvoteComment = function(post, comment) {
		return $http.put('/posts/' + post._id + '/comments/' + comment._id + '/upvote')
		.success(function(data){
			console.log('angular app upvoteComment success');
			comment.upvotes += 1;
		});
	};
	return o;
}])
.controller('MainCtrl', ['$scope', 'posts', function($scope, posts){
	// $scope.posts = [
	// 	{title: 'post 1', upvotes: 5},
	// 	{title: 'post 2', upvotes: 2},
	// 	{title: 'post 3', upvotes: 15},
	// 	{title: 'post 4', upvotes: 9},
	// 	{title: 'post 5', upvotes: 4}
	// ];
	$scope.posts = posts.posts;

	$scope.incrementUpvotes = function(post) {
		// post.upvotes += 1;
		posts.upvote(post)
	}

	$scope.addPost = function() {
		if ($scope.title === '') { return; }

		// $scope.posts.push({
		// 	title: $scope.title,
		// 	link: $scope.link,
		// 	upvotes: 0,
		// 	comments: [
		// 		{author: 'Joe', body: 'Cool post!', upvotes: 0},
		// 		{author: 'Bob', body: 'Great idea but everything is wrong!', upvotes: 0}
		// 	]
		// });
		//wiring up
		posts.create({
			title: $scope.title,
			link: $scope.link,
		});
		$scope.title = '';	
		$scope.link = '';

	}

	
}])
.controller('PostsCtrl', ['$scope',/* '$stateParams',*/ 'posts', 'post',  
	function($scope,/* $stateParams,*/ posts, post){
		// $scope.post = posts.posts[$stateParams.id];
		$scope.post = post;
		$scope.addComment = function() {
			if ($scope.body === '') { return; }
			// $scope.post.comments.push({
			// 	body: $scope.body,
			// 	author: 'user',
			// 	upvotes: 0
			// });
			//wiring up
			posts.addComment(post._id, {
				body: $scope.body,
				author: 'user'
			}).success(function(comment){
				$scope.post.comments.push(comment);
			});
			$scope.body = '';
		}
		$scope.incrementUpvotes = function(comment) {
			console.log('click comment: ' + JSON.stringify(comment));
			posts.upvoteComment(post, comment);
		};
}]);