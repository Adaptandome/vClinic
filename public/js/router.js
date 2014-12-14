//Definida una lista de patrones observados por router, tras el http:...:80#index , por ejemplo
// se pasa el path completo views/index, pues no se definió en require.js
define(['views/index','views/registro','views/login', 'views/forgotpassword'],
	function(IndexView, RegisterView, LoginView, ForgotPasswordView) {	
		// extend permite crear una clase propia de tipo Router.
		var OrgRouter = Backbone.Router.extend({
			currentView: null,
			//el primer dato del par, nombre, es la ruta tras # en la URL y el valor
			//como se llama la función.
			routes: {"index": "index",
				"registro": "register",
				"login": "login",
				"forgotpassword": "forgotpassword"				
				// ejemplo más completo--> "search/:query/p:page": "search"  //#search/kiwis/p7
			},
			//Función propia de router.js
			changeView: function(view){
			//Controlar el estado de la sesión, si no se ha logado todavía para no permitir el cambio de pantalla.

				if (null != this.currentView) {
					//Al cambiar de view se para de escuchar los eventos en la precedente
					//con undelegateEvents, para evitar tener pantallas zombies
					this.currentView.undelegateEvents();
				}
				this.currentView = view;
				this.currentView.render();
			},

			login: function() {

				this.changeView(LoginView);
				//Como en Login.js se realiza una new loginView, aquí se llama directamente, sin new.
				//this.changeView(new LoginView());
			},

			index: function() {
				
				this.changeView(IndexView);

			},

			forgotpassword: function() { 
				
				this.changeView(ForgotPasswordView);
			},

			register: function() {
				this.changeView(RegisterView);
			},

			

		});
		return new OrgRouter();
	});