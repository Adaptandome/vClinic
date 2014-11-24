/*New instance of express*/
var express = require('express');
/*La var express es usada como función, ya que estas son un objeto de primera
clase en Javascript, y por tanto las variables pueden utilizarse como variables */
var app = express();

var nodemailer = require('nodemailer');

//Expresjs's built in memory store. Para salvar los datos de la sesión.
//WARNING!! no está diseñado para su implementación en entornos de producción.
// Ya que puede tener fugas de memoria (leak memory).
// Recomendable uasr redis o mongo-connect
var MemoryStore = require('connect').session.MemoryStore;

// Se importa la capa de datos mongoose
var mongoose = require('mongoose');

// En Account.js se utiliza la variable mail del objeto config, mail.config (ver Account.js)
// Se podría pasar más de una variable, por ejemplo:
// {mail: require('./configmail.json'), mailto: require('./configToMail.json')};
var config =  {mail: require('./configmail.json')};

// Se importa el módulo Account.js. Este se define exportando tres argmentos (ver Account.js),
// En este caso, con el objeto "config" se pasa una variable: mail.
var Account = require('./models/Account')(config, mongoose, nodemailer);

/*Configure is useful for controlling settings that change between environments
Está pensado para leer el contenido de la variable de entorno NODE_ENV en el
entorno que se despliegue*/
app.configure(function(){
  // 
  //app.use(express.logger());
  /*Declaración de directorio padre para la descarga de ficheros estáticos
    __dirname - directorio del script ejecutándose en ese momento - es uno de 
    los varios objetos globales disponibes a todos los módulos dentro de Node*/
  app.use(express.static(__dirname + '/public')); 
  app.set('view engine', 'jade');
  app.set('view options', {layout: true });
  //app.set('view options');
  app.set('views',__dirname + '/views');

  app.use(express.limit('1mb'));
  app.use(express.favicon());
  //Para almacenar los datos de la sesión como cookie de sesión.
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //Puede incluirse key: "somekey" . Y {reapInterval: 60000 * 10} dentro de MemoryStore()
  //MemoryStore no persiste la session. Si se quiere persistir es necesario usar Redis o Mongo
  app.use(express.session({secret: "secret key", store: new MemoryStore()}));
  mongoose.connect('mongodb://localhost/nodebackbone');
});

app.get('/', function (req, res) {
  console.log('De entrada ver si pasa por raiz ');
  //res.render("index.jade", {layout:false}); 
  res.render("index.jade");
});

app.get('/account/authenticated', function (req, res) { 
  //La particula de middleware session, permite identificar datos de un usuario 
  //no solo en el mensaje enviado desde el web-browser, si no también del almacenamiento 
  //en  memoria
  console.log('Al comprobar si está autenticado la sesión : ' + req.session.loggedIn);
  req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
  console.log('Numero visitaqs : ' + req.session.visitCount);

  if (req.session.loggedIn) {
    res.send(200);
  } else {
    res.send(401);
  }
});


// Handler para efectuar un login 
app.post('/login', function (req, res) {
  var email = req.param('email', null);
  var password = req.param('password', null);
  
  if (null == email || email.length < 1 
      || null == password || password.length < 1) {
    res.send(400);
    return;
  }

  Account.login(email, password, function(success){
    if (!success){
      // res.send(401, 'Sorry, we cannot find that user!')
      res.send(401);
      return;
    }
    console.log('login was successful');
    req.session.loggedIn = true;
    //res.send("loggedIn");
    res.send(200);    
  });
});

//Handler para efectuar un registro
app.post('/registro', function (req, res) {

  console.log('Registro de app ');
  
  var nombre = req.param('nombre','');
  var apellido = req.param('apellido','');
  var email = req.param('email', null);
  var password = req.param('password', null);

  if (null == email || email.length < 1 
    || null == password || password.length < 1) {
    res.send(400);
    return;
  }
  Account.registrar(nombre, apellido, email, password);
  res.send(200);
});


app.post('/forgotPassword', function (req, res) {
  var hostname = req.headers.host;
  var resetPasswordUrl = 'http://' + hostname + '/resetPassword';
  var email = req.param('email', null);

  if (null == email || email.length < 1) {
    res.send(400);
    return;
  }

  Account.forgotPassword(email, resetPasswordUrl, function(success){
    if (success) {
      console.log('Reseteo de pwd realizado correctamente!' );
      res.send(200);
    }else {
      console.log('Error al llamar a reseteo de passwd de Account ');
      res.send(404);
    }
  });

});

app.get('/resetPassword',function (req, res){
  var accountId = req.param('account', null);
  //res.render('resetPassword.jade', {locals:{accountId:accountId}});
  console.log('Paso por reseto ... ' );
  res.render('resetPassword.jade'); 
});

app.post('/resetPassword', function (req, res){
  var accountId = req.param('accountId', null);
  var password = req.param('password', null);
  if ( null != accountId && null != password) {
    Account.changePassword(accountId, password);
  }
  res.render('resetPasswordSuccess.jade');
});

var port = process.env.PORT || 5000; /*En Heroku no se puede asignar un puerto fijo*/
app.listen(port);
console.log('listening on port ' + port);