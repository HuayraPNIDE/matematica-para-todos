var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var local_ip = require('my-local-ip')()

function conectado(socket)
{
	var jugador_ip = socket.handshake.address;
	console.log("Se unio un jugador en "+jugador_ip);
}

function desconectado(socket)
{
	var jugador_ip = socket.handshake.address;
	console.log("Se fue un jugador en "+jugador_ip);
}

function iniciar_servidor(puerto)
{
	var jugadores = [];
	var MAX_JUGADORES = 2;

	io.on('connection', function(socket) {
		if(jugadores.length >= MAX_JUGADORES) {
			console.log('Se conecto el maximo de jugadores: '+jugadores);
			return;
		}

		var jugador_ip = socket.handshake.address;
		jugadores.push(jugador_ip);

		//jugadores++;
		console.log('Hay conectados '+jugadores.length+' jugadores');
		conectado(socket);

		//if(jugadores == MAX_JUGADORES) {
		//	io.emit('listos', 'Estamos listos
		//}

		socket.on('disconnect', function(){
			var index = jugadores.indexOf(jugador_ip);
			jugadores.splice(index, 1);
			console.log('Hay conectados '+jugadores.length+' jugadores');
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
