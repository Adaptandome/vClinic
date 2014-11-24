/*Se define un módulo como función con 
  la estructura de dependencias de la aplicación, llamada desde
  el bootstrapper de requirejs (boot.js) */

define(['router','facebook'],
	function(router,FB) {

	//Función para inicializar y configurar el SDK de facebook. En este caso nos aseguramos
	//con Require.js de que las librerías de jQuery y Facebook han sido cargados
	FB.init({
      appId      : '596710080449688',
      status     : true,
      xfbml      : true,
      cookie	 : true,
      version    : 'v2.0'
    });

    //Se comprueba si el usuario está logado o no.
	var initialize = function(){ 
		checkLogin(runApplication);
	};

	var checkLogin = function(callback) {
	    //.ajax es una funcion de jQuery que simula la acción de un humano 
	    //navegando a la URL. 
	    //Para acceder a la funcionalidad de jQuery, se crea un objeto simple en una varialbe global
	    //Este objeto es el $. De forma similar se accede a la funcionalidad de underscore, pero el objeto es _.

	    //ajax permite intercambiar datos con el servidor de forma asíncrona.
        $.ajax("/account/authenticated",{
        	method: "GET",
        	//En este caso, al usar un return estamos concatenando las llamadas de forma síncrona.
        	//El usar un callback nos permite llamar a la función runApplication cuando necesitamos
        	//ejecutarla, es decir, una vez que hemos obtenido la respuesta de la petición Ajax.
        	success: function(){
        		return callback(true);
        	},
        	error: function(data) {
        		return callback(false);
        	}
        });

	};

	var runApplication = function(authenticated) {
		//antes habría que comprobar si es una url para reset de pwd, si no le colocará o un login o un index,
		//que está muy bien como control, pero impide el acceso a la ventana de reseteo JAPS_REV
		if (!authenticated) {
			window.location.hash = "login";
		} else{
			window.location.hash = "index";

		}
		//Comienza a monitorizar hashchange events y asignar rutas.
		//Si se volviera a llamar se produciría un error, para controlarlo, con Backbone.History.started
		//nos indica si ya ha sido llamado
		Backbone.history.start();
	}
       
	return { 
        // Hace accesible las funciones al exterior
		initialize: initialize 
	};
});