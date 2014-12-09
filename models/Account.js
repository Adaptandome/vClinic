// Con require (ver app.js) todo funciona con módulos, por eso se utiliza module.exports
// Al exportarse la función con argumentos se podrá utilizar en origen (app.js) para pasar variables
module.exports = function(config, mongoose, nodemailer) {
	var crypto = require('crypto');
	var AccountSchema = new mongoose.Schema({
		email: {type: String, unique:true},
		//id: {type: String},
		username: {type: String},
		password: {type: String},
		name: {
			first: {type: String},
			last: {type: String}
		},
		/*
		//Primero hay que actualizar la BD:
		//db.nodebackbone.update({},{$set:{"gender":""},false,true}); o
		//db.collections.update({},,{$set:{"gender":""},{upsert:true, multi:true})
		birthday: {
			day: {type: Number, min:1, max:31, required: false},
			month: {type: Number, min:1, max:12, required: false},
			year: {type: Number}
		},
		photoUrl: {type: String},
		gender: {type: String},
		locale: {type: String},
		link: {type: String}
		*/
	});

	var Account = mongoose.model('Account', AccountSchema);
	
	var registerCallback =function(err) {
		if (err) {
			return console.log(err);
		};
		return console.log('Account was created');
	};

	var changePassword = function(accountId, newpassword) {
		console.log('Llega a seccion de cambio ' );
		var shaSum = crypto.createHash('sha256');
		shaSum.update(newpassword);
		var hashedPassword = shaSum.digest('hex');
		/*Con la opcioin de upsert a false nos aseguramos que el cambio se realizaría solo
		en un documento existente*/
		Account.update({_id:accountId}, {$set: {password:hashedPassword}},{upsert:false},
			function changePasswordCallback(err){
				console.log('Change password done for account' + accountId);
			});
	};

	var forgotPassword = function(email, resetPasswordUrl, callback){
		/*Búsqueda de usuario, si no se encuentra en la BD Account, es que no existe y por tanto err,
		  si se encuentra se extrae el registo en forma de doc y se coge su id para que se pueda 
		  utilizar como referencia unívoca. Se envía como link para poder modificar la pwd*/
		var user = Account.findOne({email: email}, function findAccount(err, doc){
			//si no se encuentra el usuario, controlar que la cuenta vacía, con doc=null, entra en if (err).
			if (err || null == doc){
				console.log('Error al intentar acceder a registro de : ' + user);
				callback(false);
			}else {
				// Con config.mail se utiliza la variable mail definida en el objeto config de app.js:
				// var config =  {mail: require('./configmail.json')};
				var smtpTransport = nodemailer.createTransport('SMTP', config.mail);
				resetPasswordUrl += '?account=' + doc._id;
				console.log('Cuenta de usuario localizada en BD: ' + resetPasswordUrl);
				smtpTransport.sendMail({
					from: 'proj.japs@gmail.com',
					to: doc.email,
					subject: 'O2O Password Request',
					text: 'Click here to reset your password: ' + resetPasswordUrl
				}, function forgotPasswordResult(err) {
					/*Si se produce algún tipo de error en el envío se devuelve false*/
					if (err) {
						callback(false);
					} else {
						callback(true);
					}
				});
			}
		});
	};

    var login = function(username, password, callback) {
    	var shaSum = crypto.createHash('sha256');
    	shaSum.update(password);
    	Account.findOne({username:username,password:shaSum.digest('hex')}, function(er,doc){
    		/*Si no se encuentra una cuenta la variable doc será null, en cualquier caso
    		  se extrae de MongoDB*/
    		callback(null!=doc);
    	});
    };
	
	var registra = function(nombre, apellido, username, email, password) {
		var shaSum = crypto.createHash('sha256');
		shaSum.update(password);

		console.log('Registering a ' + email);
		var user = new Account({
			email: email,
			username: username,
			name:{
				first: nombre,
				last: apellido
			},
			password: shaSum.digest('hex')
		});
		user.save(registerCallback);
		console.log('Save command was sent');
	}
	
	return{
		registrar: registra,
		forgotPassword: forgotPassword,
		changePassword: changePassword,
		login: login,
		Account: Account
	}
}