/*New instance of express. Se usa la API de requirejs para cargar módulos */
var express = require('express');
var swig = require('swig');
/* El módulo path se puede utilizar para obtener ficheros 
var path = require('path');*/

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
var apiSecreto = 'EKfzLEHfkNMm_m55XUypSFhK61ls4xN2SPpQ6UDuqL0';
var vline = require('./modules/vline')(serviceId, apiSecreto, jwt);

//valores para usar la API de OpenTok
var apiKey = "45101132";
var apiSecret = "576c49beb6ffb75f1a7174b7363ca84ba3a9a349";

var OpenTok = require('opentok');
var opentok = new OpenTok(apiKey, apiSecret);

/*Configure is useful for controlling settings that change between environments
Está pensado para leer el contenido de la variable de entorno NODE_ENV en el
entorno que se despliegue*/
app.configure(function(){

  //A continuación diferentes MIDDLEWARES utilizados con expressJS:
  //app.use(express.logger());
  /*Declaración de directorio padre para la descarga de ficheros estáticos
    __dirname - directorio del script ejecutándose en ese momento - es uno de 
    los varios objetos globales disponibes a todos los módulos dentro de Node*/

  //En express4 todo el middleware se elimina y tiene que ser llamadpo independientemente, 
  //en este caso serve-static. En la versión 3.0 todas estas dependencias estaban incluidas 
  //en el paquete Connect (que es el FW HTTP de Node): http://scotch.io/bar-talk/expressjs-4-0-new-features-and-upgrading-from-3-0
  app.use(express.static(__dirname + '/public')); 

  //logs de conexiones
  //app.use(express.logger());

  //app.set('view engine', 'jade'); Si se hubiera dejado por defecto el motor de jade
  //app.set('views',__dirname + '/views'); //en vez de __dirname podría utilizarse process.cwd()

  app.set('view engine', 'html');
  //app.set('view options', {layout: true }); //puede quitarse la opcion de layout
  app.set('views',__dirname + '/views');

  app.set('view cache', false);

  //en PRODucción queremos que se cache las tempolates, so cache: true
  swig.setDefaults({ cache: false });

  //No depende más de Connect y hay que cargar como un repo aparte: raw-body
  app.use(express.limit('1mb'));
  //En express4 cambia a serve-favicon
  app.use(express.favicon());
  //Para almacenar los datos de la sesión como cookie de sesión.
  //En express4 cambia a: body-parser y cookie-parser (otros son cookies y keygrip) respectivamente.
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  //Puede incluirse key: "somekey" . Y {reapInterval: 60000 * 10} dentro de MemoryStore()
  //MemoryStore no persiste la session. Si se quiere persistir es necesario usar Redis o Mongo
  //También session cambia a express-session
  app.use(express.session({secret: "secret key", store: new MemoryStore()}));

});

/* Para crear un sub routing:
var blog = express();

app.use('/blog',blog);

blog.on('mount', function(app){
  console.log(app);
});

blog.get('/',function (req, res) {
  console.log('Pasa por blog' + req.baseUrl);
  res.render('blog/blog.html', {'title':'vClinic', 'header': 'Blog'});
});
//Mejor el ejmplo de Express 4: http://scotch.io/tutorials/javascript/learn-to-use-the-new-router-in-expressjs-4

var router = express.Router();

// El problema es que enruta automáticamente a las pantallas y VERBS definidos para app
// Si quisiera secciones únicas para blog ...?

// Para extraer parámetros pasados en la query string de un URL utilizamos app.param() que se ejecuta antes que app.VERB

app.param('id', function (req, res, next, id){
  //resuperar id
  next(); //opcional, para cambiar la ejecución del flujo al siguiente next handler, en este caso el get de /path/id
});

app.get('/path/:id', function(req,res){
  res.send(data);
});
*/

app.get('/',function (req, res) {
  console.log('De entrada ver si pasa por raiz ');
  res.render('main.html', {'title':'vClinic', 'header': 'Template with swig'});
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

  console.log('Pasa por index para lanzar conection a openTok');

  opentok.createSession({},function(err, session) {
    if (err){
      res.send(401) ;
      return ;
    }
    // save the sessionId --> db.save('session', session.sessionId, done);

    //var sessionID = session.sessionId
    var sessionID = "1_MX40NTEwMTEzMn5-MTQxODM4ODIwMDU3MH5vaWFVdzhOeEYxcmJBdThCSmE1OWNEZWh-UH4";
    
    //Generamos Token desde el identificador generado al crear la sesión 
    //o desde el objeto sesión directamente (incluyendo algunas opciones)

    /* Muestra un error de que session no tiene el método generateToken
    var token = session.generateToken({
      //role:'moderator',
      //data :'name=Johnny',
      expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60) // in one week
    });*/
    var tokenOptions = {role : "moderator"};
    var token = opentok.generateToken(sessionID, tokenOptions);
    res.status(200).json({sessionId: sessionID, token: token});
  });

    //var vlineAuthToken = vline.createToken(req.session.user);
    //res.status(200).json({ses: req.session.user, jwt: vlineAuthToken, serviceId: serviceId});
    //res.set({'Content-Type': 'application/json; charset=utf-8'}).send(200, JSON.stringify({ses: req.session, jwt: vlineAuthToken, serviceId: serviceId}, undefined, ' '));  
  
});


app.get('/subscribir', function (req, res) {

  console.log('Pasa por subscriber para lanzar conection a openTok');

  opentok.createSession({},function(err, session) {
    if (err){
      res.send(401) ;
      return ;
    }
    // save the sessionId --> db.save('session', session.sessionId, done);

    //Generamos Token desde el identificador generado al crear la sesión 
    
    //var sessionID = session.sessionId
    var sessionID = "1_MX40NTEwMTEzMn5-MTQxODM4ODIwMDU3MH5vaWFVdzhOeEYxcmJBdThCSmE1OWNEZWh-UH4";
    
    //o desde el objeto sesión directamente (incluyendo algunas opciones)

    /* Muestra un error de que session no tiene el método generateToken
    var token = session.generateToken({
      //role:'moderator',
      //data :'name=Johnny',
      expireTime : (new Date().getTime() / 1000)+(7 * 24 * 60 * 60) // in one week
    });*/
    var tokenOptions = {role : "publisher"};
    var token = opentok.generateToken(sessionID, tokenOptions);
    res.status(200).json({sessionId: sessionID, token: token});
  });

    //var vlineAuthToken = vline.createToken(req.session.user);
    //res.status(200).json({ses: req.session.user, jwt: vlineAuthToken, serviceId: serviceId});
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