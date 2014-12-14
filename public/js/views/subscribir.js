/*Al anteponer text! a la ruta estamos utilizando el plugin de Require.js para 
serializar a texto el contenido html del fichero conection.html. 
*/

define(['text!templates/subscribir.html'], function(subscribirTemplate){


	var subscribirView = Backbone.View.extend({
		el: $('#content'),
    
		render: function() {
			
			this.$el.html(subscribirTemplate);
		}
	});
    
	// La función devuelve un objeto que define el módulo
	return new subscribirView;
});