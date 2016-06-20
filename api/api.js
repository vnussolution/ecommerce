/**
 * Created by M6600 on 6/15/2016.
 */
var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');


router.post('/search', function (req,res,next) {
	Product.search({
		query_string:{query:req.body.search_term}},{hydrate:true}
	, function (err,results) {
		if(err) return next(err);
		console.log(' api.js search : ',results);
		res.json(results);
		console.log(' api.js search :12 ');
	})
});

//generate 20 items randomly using faker.js
router.get('/:name', function (req, res, next) {
	async.waterfall([
		function (callback) {
			Category.findOne({name: req.params.name}, function (err, category) {
				if (err) return next(err);
				callback(null, category);
			})
		},
		function (category, callback) {
			for (var i = 0; i < 20; i++) {
				var product = new Product();
				product.category = category._id;
				product.name = faker.commerce.productName();
				product.price = faker.commerce.price();
				product.image = 'https://placeimg.com/640/480/arch/sepia';//faker.image.image();
				product.save();
			}
		}
	]);
	res.json({message: 'Success adding product to cat'});
});

module.exports = router;