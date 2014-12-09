/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero conection.html. 
*/

define(['text!templates/videoscreen.html'], function(videoscreenTemplate){


	var videoscreenView = Backbone.View.extend({
		el: $('#content'),
    
		render: function() {
			this.$el.html(videoscreenTemplate);
		}
	});
    
	// La función devuelve un objeto que define el módulo
	return new videoscreenView;
});