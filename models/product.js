/**
 * Created by M6600 on 6/12/2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosastic = require('mongoosastic');

var ProductSchema = new Schema({
	category:{type:Schema.Types.ObjectId,ref:'Category'},
	name:{type:String, es_indexed:true},
	price:Number,
	image:String
});

ProductSchema.plugin(mongoosastic,{
	hosts:['http://142.129.69.110:9200']
	//,log:'trace'
});

module.exports = mongoose.model('Product', ProductSchema);