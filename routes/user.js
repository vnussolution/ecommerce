/**
 * Created by M6600 on 6/13/2016.
 */
var router = require('express').Router();
var User = require('../models/user');
var Cart = require('../models/cart');
var passport = require('passport');
var passportConfig = require('../config/passport');
var async = require('async');


router.get('/login', function (req, res) {
	if (req.user) return res.redirect('/');
	res.render('accounts/login', {message: req.flash('loginMessage')})
});

router.post('/login', passport.authenticate('local-login', {
	successRedirect: '/profile',
	failureRedirect: '/login',
	failureFlash: true
}));

router.get('/profile',passportConfig.isAuthenticated, function (req, res) {
	// check if user is logged in
	if (!req.user) return res.redirect('/login');

	User.findOne({_id: req.user._id})
		.populate('history.item')
		.exec(function (err, foundUser) {
		if (err) return next(err);
		res.render('accounts/profile', {user: foundUser});
	});

});


router.get('/signup', function (req, res, next) {
	res.render('accounts/signup', {errorMessage: req.flash('alreadyExist')});
});


router.post('/signup', function (req, res, next) {

	async.waterfall([
		function (callback) {
			var user = new User();

			user.profile.name = req.body.name;
			user.email = req.body.email;
			user.password = req.body.password;
			user.profile.picture = user.gravatar();

			User.findOne({email: req.body.email}, function (err, existingUser) {
				if (existingUser) {
					console.log(req.body.email + 'is alreay exist');
					req.flash('alreadyExist', 'Account with that email already exists');
					return res.redirect('/signup');
				} else {
					user.save(function (err, user) {
						if (err) return next(err);
						callback(null, user);
					});
				}
			});
		},
		function (user) {
			var cart = new Cart();
			cart.owner = user._id;
			cart.save(function (err) {
				if (err) return next(err);
				req.logIn(user, function (err) {
					if (err) return next(err);
					res.redirect('/profile');
				})
			})
		}
	]);
});


router.get('/logout', function (req, res, next) {
	req.logout();
	res.redirect('/');
});

router.get('/edit-profile', function (req, res, next) {
	res.render('accounts/edit-profile', {message: req.flash('success')});
});

router.post('/edit-profile', function (req, res, next) {
	User.findOne({_id: req.user._id}, function (err, user) {
		if (err) return next(err);

		if (req.body.name) user.profile.name = req.body.name;
		if (req.body.address) user.address = req.body.address;

		user.save(function (err) {
			if (err) return next(err);
			req.flash('success', 'Successfully edited your profile');
			return res.redirect('/edit-profile');
		});
	});
});

// login with facebook
router.get('/auth/facebook',passport.authenticate('passportFacebook',{score:'email'}));

router.get('/auth/facebook/callback', passport.authenticate('passportFacebook',{
	successRedirect:'/profile',
	failureRedirect:'/login'
}));

module.exports = router;