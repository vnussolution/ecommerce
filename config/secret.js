/**
 * Created by M6600 on 6/13/2016.
 */
module.exports = {
	database:'mongodb://root:frank@ds051831.mlab.com:51831/ecommerce',
	secret:'frankie',
	port:23198,

	facebook: {
		clientID: process.env.FACEBOOK || '1766500716929437',
		clientSecret: process.env.FACEBOOK_SECRET || '87e439874771d8840989222ef97c1c2d',
		profileFields: ['email','displayName'],
		callbackURL: 'http://142.129.69.110:23198/auth/facebook/callback'
	}


};