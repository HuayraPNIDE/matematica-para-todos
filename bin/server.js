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
	console.log("Se fue un jugador en "+jugador_ip+"\n");
}

function iniciar_servidor(puerto)
{
	var jugadores = [];
	var MAX_JUGADORES = 2;

	var mazo_jugador1 = [];
	var mazo_jugador2 = [];

	var respuestas = [];
	var i = 1;

	var historico_respuestas = [];
	var opcion_respuestas = [];
	var obj_ip_jugador = {};
	var obj_cartas_jugador = {};
	obj_cartas_jugador['jugador1'] = 0;
	obj_cartas_jugador['jugador2'] = 0;
	var cartas_guerra = 0;

	io.on('connection', function(socket) {

		socket.on('respuesta', function(opcion) {
			console.log('Se jugo la mano numero '+i+'\n');
			respuestas.push(jugador_ip);
			
			opcion_respuestas.push(opcion);

			//console.log('Tengo '+respuestas.length+' respuestas');
			console.log('Tengo respuesta de '+jugador_ip+' y vale '+opcion);
			if(respuestas.length == 2) {

				if(i == 24) {
					console.log('Ya se repartieron todas las cartas');
					console.log('Se muestra historico de respuestas');
					console.log(historico_respuestas);

					console.log('El jugador1 uno tiene '+obj_cartas_jugador.jugador1+' cartas');
					console.log('El jugador2 uno tiene '+obj_cartas_jugador.jugador2+' cartas');
					io.emit('fin', historico_respuestas);
					i = 0;
					return;
				}

				var lados_j1 = 0;
				var lados_j2 = 0;

				if(i == 1) {

					if(mazo_jugador1[0].lados > mazo_jugador2[0].lados) {
						respuesta_real = "jugador1";
					} else if(mazo_jugador1[0].lados < mazo_jugador2[0].lados) {
						respuesta_real = "jugador2";
					} else {
						respuesta_real = "empate";
					}

					lados_j1 = mazo_jugador1[0].lados;
					lados_j2 = mazo_jugador2[0].lados;


				} else {
					if(mazo_jugador1[i].lados > mazo_jugador2[i].lados) {
						respuesta_real = "jugador1";
					} else if(mazo_jugador1[i].lados < mazo_jugador2[i].lados) {
						respuesta_real = "jugador2";
					} else {
						respuesta_real = "empate";
					}

					lados_j1 = mazo_jugador1[i].lados;
					lados_j2 = mazo_jugador2[i].lados;
				}


				console.log("\tOpcion real:" + respuesta_real);
				console.log("Opciones jugadores: " + opcion_respuestas);

				if(opcion_respuestas[0] == opcion_respuestas[1]) { //Jugador1 y Jugador2 opinan lo mismo
					if(opcion_respuestas[0] == 'empate') {
						console.log('Aca hay guerra');
						cartas_guerra++;
					} else {
						console.log('Las respuestas son iguales, la cartas es para '+opcion_respuestas[0]);

						if(cartas_guerra) {
							console.log('Hay '+cartas_guerra+' retenidas por guerra\nSe las queda '+opcion_respuestas[0]);
							obj_cartas_jugador[opcion_respuestas[0]] += cartas_guerra;
							cartas_guerra = 0;
						}
						obj_cartas_jugador[opcion_respuestas[0]]++;
						historico_respuestas.push({"respuesta_real": respuesta_real, "respuesta_jugadores": opcion_respuestas[0], "lados_jugador1": lados_j1, "lados_jugador2": lados_j2});
					}
				} else {
					console.log('Las respuestas difieren, repreguntar');
				}

				

				io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i]});
				i++;
				respuestas = [];
				opcion_respuestas = [];
			}
		});

		if(jugadores.length >= MAX_JUGADORES) {
			console.log('Se conecto el maximo de jugadores: '+jugadores);
			return;
		}


		var jugador_ip = socket.handshake.address;
		var nombre_jugador = socket.handshake.query.nombre_jugador;

		jugadores.push(jugador_ip);

		obj_ip_jugador[nombre_jugador] = jugador_ip;

		//jugadores++;
		console.log('Hay conectados '+jugadores.length+' jugadores');
		conectado(socket);

		if(jugadores.length == MAX_JUGADORES) {
			console.log("\nYa tenemos a todos los jugadores");
			console.log("Arrancamos el juego");

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

			io.emit('listo', obj_ip_jugador); //Evento para armar interfaz de los clientes
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
