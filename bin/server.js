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

	var mazo_jugador1 = [];
	var mazo_jugador2 = [];

	var respuestas = [];
	var i = 1;

	io.on('connection', function(socket) {

		socket.on('respuesta', function(msg) {
			respuestas.push(jugador_ip);

			console.log('Tengo '+respuestas.length+' respuestas');
			if(respuestas.length == 2) {
				respuestas.forEach(function(ip) {
					console.log(ip+' respondio');
				});

				console.log('Se repartieron '+i+' cartas');
				if(i == 24) {
					console.log('Ya se repartieron todas las cartas');
					io.emit('fin');
				}

				io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i]});
				i++;
				respuestas = [];
			}
		});

		if(jugadores.length >= MAX_JUGADORES) {
			console.log('Se conecto el maximo de jugadores: '+jugadores);
			return;
		}

		var jugador_ip = socket.handshake.address;
		jugadores.push(jugador_ip);

		//jugadores++;
		console.log('Hay conectados '+jugadores.length+' jugadores');
		conectado(socket);

		if(jugadores.length == MAX_JUGADORES) {
			console.log("\nYa tenemos a todos los jugadores");
			console.log("Arrancamos el juego");
			/*
			jugadores.forEach(function(jugador) {
				console.log(jugador);
			});
			*/

			var mazo = require('../src/mazo.json');
			var mazo_completo = mazo.mazo;
			mazo_completo = mazo_completo.concat(mazo.mazo);


			for(var k = 0; k < 24; k++) {
				var id_carta_jugador1 = Math.floor(Math.random() * mazo_completo.length);
				var carta_jugador1 = mazo_completo[id_carta_jugador1];
				mazo_jugador1.push(carta_jugador1);
				mazo_completo.splice(id_carta_jugador1, 1);

				var id_carta_jugador2 = Math.floor(Math.random() * mazo_completo.length);
				var carta_jugador2 = mazo_completo[id_carta_jugador2];
				mazo_jugador2.push(carta_jugador2);
				mazo_completo.splice(id_carta_jugador2, 1);
			}

			io.emit('listo', jugadores); //Evento para armar interfaz de los clientes

			io.emit('mano', {"carta1": mazo_jugador1[0], "carta2": mazo_jugador2[0]});
		}

		socket.on('disconnect', function(){
			var index = jugadores.indexOf(jugador_ip);
			jugadores.splice(index, 1);
			io.emit('retiro', jugador_ip);
			desconectado(socket);
			console.log('Hay conectados '+jugadores.length+' jugadores');
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
