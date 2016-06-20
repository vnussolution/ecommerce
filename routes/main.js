/**
 * Created by M6600 on 6/13/2016.
 */

var router = require('express').Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var User = require('../models/user');
var async = require('async');
var stripe = require('stripe')('sk_test_HhOHm7zHNuAC8iDSd9hNqDW4');


Product.createMapping(function (err, mapping) {
	if (err) {
		console.log('error creating mapping');
		console.log(err);
	} else {
		console.log('mapping created');
		console.log(mapping);
	}
});

var stream = Product.synchronize();
var count = 0;

stream.on('data', function () {
	count++;
});

stream.on('close', function () {
	console.log('indexed : ' + count + ' - documents');
});

stream.on('error', function (err) {
	console.log(err);
});


router.post('/search', function (req, res, next) {
	res.redirect('/search?query1=' + req.body.query);
});

router.get('/search', function (req, res, next) {
	console.log(' search.. ',req.query.query1);
	if (req.query.query1) {
		//Product.search({
		//	query_string: {query: req.query.query}
		//}, function (err, results) {
		//	// results = {hits:{hits:{_source:value that we want}}}
		//	if (err) return next(err);
		//	console.log('results ---> ', results);
		//	// map to create a easier way to access the data
		//	var data = results.hits.hits.map(function (hit) {
		//		console.log('hit --> ', hit);
		//		return hit;
		//	});
		//
		//	data.populate('category').exec(function (err, fullData) {
		//			if(err) return next(err);
		//			res.render('main/search-result', {
		//				query: req.query.q,
		//				data: fullData
		//			});
		//		})
		//});


		//Product.search({query_string: {query: req.query.query}},{hydrate:true}, function (err,results) {
		//	if(err) return next(err);
		//
		//	console.log('searching..',results);
		//});
		//.populate('category')
		//.exec(function (err, data) {
		//	if (err) return next(err);
		//
		//	data.hits.hits.map(function (hit) {
		//		res.render('main/search-result', {
		//			query: req.query.q,
		//			data: hit
		//		});
		//	});
		//});

		Product
			.find({name: {"$regex":req.query.query1,"$options":"i"}})
			.populate('category')
			.exec(function (err, results) {
				if(err) return next(err);
				console.log('search results : ',results.length);
				res.render('main/search-result', {
					query: req.query.query1,
					data: results
				})
			});
	}

});


function pagination(req, res, next) {
	var perPage = 9;
	var page = req.params.page;

	Product
		.find()
		.skip(perPage * page)
		.limit(perPage)
		.populate('category')
		.exec(function (err, products) {
			if (err) return next(err);
			Product.count().exec(function (err, count) {
				if (err) return next(err);
				res.render('main/product-main', {
					products: products,
					pages: count / perPage,
					activePage: page
				});
			});
		});
}


router.get('/', function (req, res, next) {
	console.log(' main.js get /');
	pagination(req, res, next);

});

router.get('/page/:page', function (req, res, next) {
	pagination(req, res, next);
});

router.get('/about', function (req, res) {
	res.render('main/about')
});

router.get('/products/:id', function (req, res, next) {

	Product.find({category: req.params.id})
		.populate('category')
		.exec(function (err, products) {
			res.render('main/category', {products: products});
		});

});

router.get('/product/:id', function (req, res, next) {
	Product.findById({_id: req.params.id}, function (err, product) {
		if (err) return next(err);
		res.render('main/product', {
			product: product
		});
	})
});


router.post('/product/:product_id', function (req, res, next) {
	// Check if user is logged in
	if (!req.user) return res.redirect('/login');
	Cart.findOne({owner: req.user._id}, function (err, cart) {

		cart.items.push({
			item: req.body.product_id,
			price: parseFloat(req.body.priceValue),
			quantity: parseInt(req.body.quantity)
		});

		cart.total = (cart.total + parseFloat(req.body.priceValue)).toFixed(2);
		cart.save(function (err) {
			if (err) return next(err);
			return res.redirect('/cart');
		});
	});
});


router.get('/cart', function (req, res, next) {

	// Check if user is logged in
	if (!req.user) return res.redirect('/login');

	Cart.findOne({owner: req.user._id})
		.populate('items.item')
		.exec(function (err, foundCart) {
			console.log(' error --> ', err);
			if (err) return next(err);

			res.render('main/cart', {foundCart: foundCart, message: req.flash('removeItem')});
		});
});

router.post('/removeItem', function (req, res, next) {
	Cart.findOne({owner: req.user._id}, function (err, foundCart) {
		foundCart.items.pull(String(req.body.item));

		foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
		foundCart.save(function (err, found) {
			if (err) return next(err);
			req.flash('removeItem', 'Successfully remove item');
			res.redirect('/cart');
		});
	});
});

router.post('/payment', function (req, res, next) {

	var stripeToken = req.body.stripeToken;
	var stripeMoney = Math.round(req.body.stripeMoney * 100); // stripe receives money in cent


	//check if time buffer session is good to do the transaction
	if (req.session.cookie.maxAge < 20000) {
		res.write('<h1>expires in: ' + (req.session.cookie.maxAge / 1000) + 's</h1>')
	}


	stripe.customers.create({
		source: stripeToken
	}).then(function (customer) {
		return stripe.charges.create({
			amount: stripeMoney,
			currency: 'usd',
			customer: customer.id
		});
	}, function (err) {
		//handle the error
		switch (err.type) {
			case 'StripeCardError':
				// A declined card error
				err.message; // => e.g. "Your card's expiration year is invalid."
				console.log('Your cards expiration year is invalid.');
				break;
			case 'RateLimitError':
				// Too many requests made to the API too quickly
				console.log('Too many requests made to the API too quickly');
				break;
			case 'StripeInvalidRequestError':
				// Invalid parameters were supplied to Stripe's API
				console.log('Invalid parameters were supplied to Stripe API');
				break;
			case 'StripeAPIError':
				// An error occurred internally with Stripe's API
				console.log('An error occurred internally with Stripe API');
				break;
			case 'StripeConnectionError':
				// Some kind of error occurred during the HTTPS communication
				console.log('Some kind of error occurred during the HTTPS communication');
				break;
			case 'StripeAuthenticationError':
				// You probably used an incorrect API key
				console.log('You probably used an incorrect API key');
				break;
			default:
				// Handle any other types of unexpected errors
				console.log('Handle any other types of unexpected errors');
				break;
		}
	}).then(function (charge) {
		async.waterfall([
			function (callback) {
				Cart.findOne({owner: req.user._id}, function (err, cart) {
					callback(err, cart);
				});
			},
			function (cart, callback) {
				User.findOne({_id: req.user._id}, function (err, user) {
					if (user) {
						for (var i = 0; i < cart.items.length; i++) {
							user.history.push({
								item: cart.items[i].item,
								quantity: cart.items[i].quantity,
								price: cart.items[i].price
							});
						}
						user.save(function (err, user) {
							if (err) return next(err);
							callback(err, user);
						})
					}
				});
			},
			function (user) {
				Cart.update({owner: user._id}, {$set: {items: [], total: 0}}, function (err, updated) {
					if (updated) {
						res.redirect('/profile');
					}
				});
			}
		]);
	});
});

module.exports = router;