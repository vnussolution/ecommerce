/**
 * Created by M6600 on 6/13/2016.
 */

var router = require('express').Router();
var Category = require('../models/category');


router.get('/add-category', function (req, res, next) {

	if(req.user.level !== 'admin') return ;
	res.render('admin/add-category',{message:req.flash('success')});
});

router.post('/add-category', function (req, res, next) {
	var category = new Category();
	
	category.name = req.body.categoryName;
	category.save(function (err) {
		if(err) return next(err);
		req.flash('success','Successfully added a category');
		return res.redirect('/add-category');
	})
});

module.exports = router;