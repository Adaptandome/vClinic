/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero index.html.
Esta formula nos permite renderizar paginas html dentro de javascript, sin tener las
cadenas de HTML en el mismo javascript
En este caso el módulo (index.html)  tiene dependencias (vline), por lo que a los módulos se les asocia 
una función que será llamada una vez se hayan cargado todas las dependencias*/

define(['text!templates/index.html', 'opentok','text!templates/videoscreen.html', 'text!templates/subscribir.html'], function(indexTemplate, opentok, videoscreenTemplate, subscribirTemplate){


	var indexView = Backbone.View.extend({
		el: $('#content'),
		events: {
			'submit #index': 'index',
			'click #btn_subscribir ':'subscribir'
		},

		subscribir: function(){

			$("#error").slideUp();

    		$.ajax({
    			url: '/subscribir',
    			type:'GET',
    			datatype: 'json',
    			success: function(data){
					
					//$("#cvline").html('<p> jwt: ' + data.ses + '</p>');
					$("#cvline").html(_.template(subscribirTemplate)({sessionId : data.sessionId, token : data.token}));
					$("#cvline").slideDown();
					$("#btn_publicar").html("");
					$("#btn_subscribir").html("");


    			},
				error: function(){
					$("#error").text('No se pudo establecer conexión.');
					$("#error").slideDown();
				}

    		})
    		return false;
		},

		index: function() {

			$("#error").slideUp();

    		$.ajax({
    			url: '/index',
    			type:'GET',
    			datatype: 'json',
    			success: function(data){
					
					//$("#cvline").html('<p> jwt: ' + data.ses + '</p>');
					$("#cvline").html(_.template(videoscreenTemplate)({sessionId : data.sessionId, token : data.token}));
					$("#cvline").slideDown();
					$("#btn_publicar").html("");
					//$("#btn_subscribir").html("");


    			},
				error: function(){
					$("#error").text('No se pudo establecer conexión.');
					$("#error").slideDown();
				}

    		})
    		return false;

		},
		
		render: function() {
			
			this.$el.html(indexTemplate);
			//this.$el.html(_.template(indexTemplate),{usuario : "usuario"});			

			/*var template = Handlebars.compile( $("#content-template").html() );
            var rendered = template(.toJSON());
                console.log(rendered);
            this.$el.html(rendered);
            return this;
			*/
		}
	});
    
	// La función devuelve un objeto que define el módulo
	return new indexView;
});