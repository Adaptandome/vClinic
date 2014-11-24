define(['text!templates/forgotpassword.html'], function(forgotpasswordTemplate) {

	var forgotpasswordView = Backbone.View.extend({
		el: $('#content'),
		events: {
			"submit #password": "password"
		},

		password: function() {
			/*$.post('/forgotpassword', { 
				email: $('input[name=email]').val()
			}, function(data) {
				console.log(data);
			});*/
			$.ajax({
				url: '/forgotpassword',
				type: 'POST',
				data: {email: $('input[name=email]').val()},
				success: function(data){
				  	// no puede mostrar datos por consola al estar ejecutándose en cliente
				  	window.location.hash = "index";
				},
				error: function(){
					$("#error").text('Email de usuario no registrado ... ');
					$("#error").slideDown();}
			})
			return false;
		},

		render: function() {
			this.$el.html(forgotpasswordTemplate);
		}
	});
	return new forgotpasswordView;
});