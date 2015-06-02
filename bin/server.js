var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

function conectado(socket)
{

	console.log("Se unio un jugador");
  	socket.on('chat message', function(msg){
    		io.emit('chat message', msg);
  	});


}

function desconectado(socket)
{
	console.log('Usuario desconectado');
}

function iniciar_servidor(puerto)
{
	var jugadores = 0;
	var MAX_JUGADORES = 2;

	io.on('connection', function(socket) {
		if(jugadores >= MAX_JUGADORES) {
			console.log('Se conecto el maximo de jugadores: '+jugadores);
			return;
		}

		jugadores++;
		console.log('Hay conectados '+jugadores+' jugadores');
		conectado(socket);

		socket.on('disconnect', function(){
			jugadores--;
			console.log('Hay conectados '+jugadores+' jugadores');
			desconectado(socket);
  		});

	});


	http.listen(puerto, function(){
		console.log('Esperando jugadores en '+puerto);
	});

}

function publicar_servidor()
{
	return 0;
}

var puerto = 3000;
iniciar_servidor(puerto);
publicar_servidor();
