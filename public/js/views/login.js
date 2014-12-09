/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero login.html.
Esta formula nos permite renderizar paginas html dentro de javascript*/
//Requirejs soporta la AMD API para módulos Java Script. Se define una única función "define".
//define no ejecutará la función hasta que no se haya cargado los módulos previos [,], en este
//caso solo está login.html, pero podría haber un facebook, por ejemplo.


define(['text!templates/login.html'], function(loginTemplate){
		
	var loginView = Backbone.View.extend({
		//Se "binds" el elemento content. Cualquier evento que se lance, tiene que estar 
		//en el elemento content (del html).
	    el: $('#content'),

		events: {
			'submit #login': 'login',
			'submit #facebook': 'facebook'
			//"Click .icon" : "open",
			//"Click .buttone.edit" : "destroy"
			//"dblclick" : "open"
			//"mouseover .title .date" : "showTooltip"
		},

		facebook: function() {
 			// Recordar que la API de FB se cargó en el modulo O2O.js
 			FB.login(function(response) 
 				{Log.info('FB.login response', response); }, //pendiente de aclarar
 				{scope: 'publish_actions'}
 			);
 			return false;

			/*FB.ui({
  				method: 'share',
  				href: 'https://developers.facebook.com/docs/'
			}, function(response){});  
  			*/	

		},

		login: function() {

    		$("#error").slideUp();
    		
			//$.post sends url-encoded data, To send json it has to be used JSON.stringify({name:value})
			/* To convert a JavaScript object into a JSON string use JSON.stringify
			   https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_native_JSON#Converting_objects_into_JSON

			   var the_object = {};
			   the_object.arg1 = "argumento 1";
			   the_object.arg2 = 2;
			   var json_text = JSON.stringify(the_object, null, 2);
			       El primer argumento es el objeto a serializar
			       El segundo es una función o un array que sirven para añadir lógica 
			       		a la selección de las propiedades del objeto a incluir. Por
			       		defecto se incluyen todas. 
			       El tercero es el núemro de espacios a intercalar en la cadena para
			           	facilitar la lectura

			   json_text contine ahora '"arg1":"argumento 1","arg2":2'

			   To convert a string to JSON object, use JSON.parse
			   var the_object = JSON.parse(json_text);

			   En jQuery se utilizan unos métodos específicos. Ver api.
			*/
			/*$.post('/login',{
				email: $('input[name=email]').val(),
				password: $('input[name=password]').val()
			}, function(data){
				console.log('login.js para data: ' + data);
			}).error(function(){
				$("#error").text('Unable to login.');
				$("#error").slideDown();
			
			});*/

			//So its better to use jQuery's $.ajax({url: '/login', type .....})
			// http://api.jquery.com/jquery.ajax/
			$.ajax({
				url: '/login',
				type: 'POST',
				data: {username: $('input[name=username]').val(),
				password: $('input[name=password]').val()},
				/* Si utilizasemos JSON:
				contentType: "application/json",
        		async: true,
        		data: JSON.stringify({email: $('input[name=email]').val(), $('input[name=password]').val()}),
        		Aunque una llamada ajax e asíncrona de por sí.
				*/
				success: function(data){
					// Se indica a qué ventana se quiere llevar, en este caso a indice.
					//El objeto location encapsula la URL de la página actual, y la propiedad hash 
					//contiene el nombre dentro del enlace.
					
				  	window.location.hash = "index";
				  	//window.location = "./vline/index"; --> Intentar si se puede redirigir a otra estructura
				  },
				error: function(){
					$("#error").text('Unable to login.');
					$("#error").slideDown();
				}

			})
			return false;
		},

		render: function() {
			this.$el.html(loginTemplate);
			$("#error").hide();
		}
	});
	

    // No hay que quitar el new --> sirve como constructor de la clase loginView (de tipo View)
	return new loginView;
});