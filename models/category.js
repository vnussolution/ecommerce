/**
 * Created by M6600 on 6/12/2016.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	name:{type:String,unique:true,lowercase:true}
});

module.exports = mongoose.model('Category', CategorySchema);