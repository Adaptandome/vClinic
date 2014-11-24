/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero index.html.
Esta formula nos permite renderizar paginas html dentro de javascript*/

define(['text!templates/register.html'], function(registerTemplate){

	var registerView = Backbone.View.extend({
		el: $('#content'),
			//fb: $('#fb'),

		events: {
			'submit #registro': 'registro'
		},

		registro: function() {
			/*$.post('/registro',{
				nombre: $('input[name=nombre]').val(),
				apellido: $('input[name=apellido]').val(),
				email: $('input[name=email]').val(),
				password: $('input[name=password]').val()
			}, function(data){
				console.log(data);
			});*/
			$.ajax({
				url: '/registro',
				type: 'POST',
				data: {
					nombre: $('input[name=nombre]').val(),
					apellido: $('input[name=apellido]').val(),
					email: $('input[name=email]').val(),
					password: $('input[name=password]').val()
				},
				success: function(data){
				  	// Se indica a qué ventana se quiere llevar, en este caso a indice.
				  	window.location.hash = "index";
				},
				error: function(){
					$("#error").text('Imposible de registrar ... ');
					$("#error").slideDown();}
			})
			return false;
		},

		render: function() {
			this.$el.html(registerTemplate);
				
		}
	});
    
	return new registerView;
});