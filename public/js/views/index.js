/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero index.html.
Esta formula nos permite renderizar paginas html dentro de javascript, sin tener las
cadenas de HTML en el mismo javascript*/

define(['text!templates/index.html'], function(indexTemplate){


	var indexView = Backbone.View.extend({
		el: $('#content'),
		
		render: function() {
			this.$el.html(indexTemplate);
		}
	});
    
	// No hay que quitar el new.
	return new indexView;
});