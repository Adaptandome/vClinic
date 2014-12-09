/*New instance of express. Se usa la API de requirejs para cargar módulos */
var express = require('express');
var swig = require('swig');
var path = require('path');

/*La var express es usada como función, ya que estas son un objeto de primera
clase en Javascript, y por tanto las variables pueden utilizarse como variables */
var app = express();

//El template engine por defecto de express es jade. Nosotros utilizaremos swig,
//por lo que hay que cargar previamente consolidate para ayudar a integrar swig en express
var cons = require('consolidate');
app.engine('html', cons.swig);


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

// valores para usar la api de vline
var jwt = require('green-jwt');
var serviceId = 'virtualclinic';
var apiSecret = 'EKfzLEHfkNMm_m55XUypSFhK61ls4xN2SPpQ6UDuqL0';
var vline = require('./modules/vline')(serviceId, apiSecret, jwt);

/*Configure is useful for controlling settings that change between environments
Está pensado para leer el contenido de la variable de entorno NODE_ENV en el
entorno que se despliegue*/
app.configure(function(){

  //app.use(express.logger());
  /*Declaración de directorio padre para la descarga de ficheros estáticos
    __dirname - directorio del script ejecutándose en ese momento - es uno de 
    los varios objetos globales disponibes a todos los módulos dentro de Node*/
  app.use(express.static(__dirname + '/public')); 

  //app.set('view engine', 'jade'); Si se hubiera dejado por defecto el motor de jade
  //app.set('views',__dirname + '/views'); //en vez de __dirname podría utilizarse process.cwd()

  app.set('view engine', 'html');
  //app.set('view options', {layout: true }); //puede quitarse la opcion de layout
  app.set('views',__dirname + '/views');

  app.set('view cache', false);

  //en PRODucción queremos que se cache las tempolates, so cache: true
  swig.setDefaults({ cache: false });

  app.use(express.limit('1mb'));
  app.use(express.favicon());
  //Para almacenar los datos de la sesión como cookie de sesión.
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //Puede incluirse key: "somekey" . Y {reapInterval: 60000 * 10} dentro de MemoryStore()
  //MemoryStore no persiste la session. Si se quiere persistir es necesario usar Redis o Mongo
  app.use(express.session({secret: "secret key", store: new MemoryStore()}));

});

app.get('/', function (req, res) {
  console.log('De entrada ver si pasa por raiz ');
  res.render('index.html', {'title':'vClinic', 'header': 'Template with swig'});
});

app.get('/account/authenticated', function (req, res) { 
  //La particula de middleware session, permite identificar datos de un usuario 
  //no solo en el mensaje enviado desde el web-browser, si no también del almacenamiento 
  //en  memoria
  console.log('Al comprobar si está autenticado la sesión : ' + req.session.loggedIn);
  req.session.visitCount = req.session.visitCount ? req.session.visitCount + 1 : 1;
  console.log('Numero visitas : ' + req.session.visitCount);

  if (req.session.loggedIn) {
    res.send(200);
  } else {
    res.send(401);
  }
});

// Handler para efectuar un login para un videochat con vline
app.get('/index', function (req, res) {

  console.log('Pasa por index para lanzar conection ');

  var vlineAuthToken = vline.createToken(req.session.user);

  res.status(200).json({ses: req.session.user, jwt: vlineAuthToken, serviceId: serviceId});
  //res.set({'Content-Type': 'application/json; charset=utf-8'}).send(200, JSON.stringify({ses: req.session, jwt: vlineAuthToken, serviceId: serviceId}, undefined, ' '));
  
});


// Handler para efectuar un login 
app.post('/login', function (req, res) {
  var username = req.param('username', null);
  var password = req.param('password', null);
  
  if (null == username || username.length < 1 
      || null == password || password.length < 1) {
    res.send(400);
    return;
  }

  Account.login(username, password, function(success){
    if (!success){
      // res.send(401, 'Sorry, we cannot find that user!')
      res.send(401);
      return;
    }
    console.log('login was successful');
    req.session.loggedIn = true;

    //Para utilizar el servicio de vLine, mantenemos el usuario de la sesión
    req.session.user=username;

    res.send(200);    
    //Otros itipos de comunicación: 
    //res.send("loggedIn");
    //res.send({authed : true});
  });
});

//Handler para efectuar un registro
app.post('/registro', function (req, res) {

  console.log('Registro de app ');
  
  var nombre = req.param('nombre','');
  var apellido = req.param('apellido','');
  var username = req.param('username','');
  var email = req.param('email', null);
  var password = req.param('password', null);

  if (null == email || email.length < 1 
    || null == password || password.length < 1) {
    res.send(400);
    return;
  }
  Account.registrar(nombre, apellido, username, email, password);

  //Para utilizar el servicio de vLine, mantenemos el usuario de la sesión
  req.session.user=username;

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

var mongoEnv = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || 'mongodb://localhost/nodebackbone';
mongoose.connect(mongoEnv, function (err, res) {
    if (err) {
    console.log ('ERROR connecting to: ' + mongoEnv + '. ' + err);
    } else {
    console.log ('Succeeded connected to: ' + mongoEnv);
    }
});


var port = process.env.PORT || 5000; /*En Heroku no se puede asignar un puerto fijo*/
app.listen(port);
console.log('listening on port ' + port);