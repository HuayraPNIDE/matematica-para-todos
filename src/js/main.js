var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function iniciar_servidor(nombre)
{
	var puerto = 3000;

	/*
	app.get('/', function(req, res){
  		res.sendFile(__dirname + '/index.html');
	});
	*/

	io.on('connection', function(socket){
  		alert("Se unio un jugador");
  		socket.on('chat message', function(msg){
    			io.emit('chat message', msg);
  		});
	});

	http.listen(puerto, function(){
	});

}
