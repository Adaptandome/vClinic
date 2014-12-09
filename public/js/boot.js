/*En algunos textos este fichero se referencia como main.js */
require.config({
	paths:{
		opentok: '/js/libs/opentok.min',
		facebook: '/js/libs/fb-sdk',
		bootstrap: '/js/libs/bootstrap.min',
		jQuery: '/js/libs/jquery-1.10.2.min',
		Underscore: '/js/libs/underscore-min',
		Backbone: '/js/libs/backbone-min',
		/*El plug-in text.js (AMD loader)  facilita la inclusión de código html 
		(texto) en un fichero javascript. Residiendo en este mismo directorio de js.
		Orientado a permitir JavaScript templating */
		text: '/js/libs/text',
		templates: '../templates'
		
	},

	shim: {
		'facebook' : {exports : "FB"},
		// 'Backbone' : {"deps" :['Underscore','jQuery']}, underscore y jQuery se declaran dependientes de Backbone:
		// cuando se vaya a cargar BAckbone, Reuirejs se asegura de que jQuery y underscore lo estén.
		'Backbone': ['Underscore','jQuery'], 
		'O2O': ['Backbone']
		
	}

});

require(['O2O'], function(O2O) {
	O2O.initialize();
});