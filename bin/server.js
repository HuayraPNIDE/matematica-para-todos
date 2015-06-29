var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var local_ip = require('my-local-ip')()
var spawn = require('child_process').spawn;

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
	var i = 0;
	var max_respuestas_diferentes = 0;

	var historico_respuestas = [];
	var opcion_respuestas = [];
	var obj_ip_jugador = {};
	var obj_cartas_jugador = {};
	obj_cartas_jugador['empate'] = 0;
	obj_cartas_jugador['eliminadas'] = 0;
	
	var cartas_guerra = 0;

	io.on('connection', function(socket) {
		socket.on('respuesta', function(opcion) {
			respuestas.push(jugador_ip);
			opcion_respuestas.push(opcion);

			//console.log('Tengo '+respuestas.length+' respuestas');
			console.log(jugador_ip+' = '+opcion);
			if(respuestas.length == 2) {
				console.log('Tengo ambas respuestas');

				var lados_j1 = 0;
				var lados_j2 = 0;

				var img_j1 = 0;
				var img_j2 = 0;

				if(mazo_jugador1[i].lados > mazo_jugador2[i].lados) {
					respuesta_real = "jugador1";
				} else if(mazo_jugador1[i].lados < mazo_jugador2[i].lados) {
					respuesta_real = "jugador2";
				} else {
					respuesta_real = "empate";
				}

				lados_j1 = mazo_jugador1[i].lados;
				lados_j2 = mazo_jugador2[i].lados;

				img_j1 = mazo_jugador1[i].img;
				img_j2 = mazo_jugador2[i].img;

				console.log("Opcion real:" + respuesta_real);
				console.log("Opciones jugadores: " + opcion_respuestas);

				if(opcion_respuestas[0] == opcion_respuestas[1]) { //Jugador1 y Jugador2 opinan lo mismo
					if(opcion_respuestas[0] == 'empate') {
						console.log('Aca hay guerra');
						cartas_guerra++;
						obj_cartas_jugador['empate']++;
					} else {
						console.log('Las respuestas son iguales, la cartas es para '+opcion_respuestas[0]);

						if(cartas_guerra) {
							console.log('Hay '+cartas_guerra+' retenidas por guerra\nSe las queda '+opcion_respuestas[0]);
							obj_cartas_jugador[opcion_respuestas[0]] += cartas_guerra;
							cartas_guerra = 0;
						}
						obj_cartas_jugador[opcion_respuestas[0]]++;
					}

					historico_respuestas.push({"respuesta_real": respuesta_real, "respuesta_jugadores": opcion_respuestas[0], "lados_jugador1": lados_j1, "lados_jugador2": lados_j2, "img_j1": img_j1, "img_j2": img_j2});
				} else {
					console.log('Las respuestas difieren\nRepregunto');
					i--; //Decremento para que vuelva a enviar la misma mano al emitir
				}

				if(i == 23) {
					console.log('Ya se repartieron todas las cartas');
					console.log('Se muestra historico de respuestas');
					console.log(historico_respuestas);

					console.log('El jugador1 uno tiene '+obj_cartas_jugador.jugador1+' cartas');
					console.log('El jugador2 uno tiene '+obj_cartas_jugador.jugador2+' cartas');
					console.log('Hubo '+obj_cartas_jugador.empate+' empatadas');
					io.emit('fin', historico_respuestas);
					i = 0;
					return;
				}

				console.log("=======================================================================");
				i++;
				console.log('Se juega ahora la mano '+i);
				io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": obj_cartas_jugador.jugador1, "contador_jugador2": obj_cartas_jugador.jugador2, "contador_guerra": cartas_guerra});
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

		if(nombre_jugador == 'jugador1') { //Hack
			nombre_jugador = usuario;
		}

		jugadores.push(jugador_ip);

		obj_cartas_jugador[nombre_jugador] = 0;
	

		obj_ip_jugador[nombre_jugador] = jugador_ip;

		//jugadores++;
		console.log('Hay conectados '+jugadores.length+' jugadores');
		conectado(socket);

		if(jugadores.length == MAX_JUGADORES) {
			console.log("\nYa tenemos a todos los jugadores");
			console.log("Arrancamos el juego");


			console.log(JSON.stringify(obj_cartas_jugador, null, 2));

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
			console.log('Se juega ahora la mano '+i);
			io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": 0, "contador_jugador2": 0, "contador_guerra": 0});
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
	cliente = spawn('avahi-publish-service',
			[
			'-s',
			'huayra_mxt-'+local_ip+'-'+usuario,
			'_http._tcp', puerto
			]
	);

	cliente.stdout.on('data', function(data) {
		//console.log("stderr", data);
	});

	cliente.on('error', function(codigo) {
		console.error("ERROR: no se puede ejecutar avahi-publish-service", codigo);
	});

	cliente.on('exit', function(codigo) {
		if (codigo)
			console.log("Error, el comando retorno: " + codigo);
		else
			console.log("ha finalizado el comando avahi-publish-service");
	});

}

var usuario;

process.argv.forEach(function (val, index, array) {

	if(/--usuario=/.test(val)) {
		usuario = val.split('=')[1];
	}
});

if(!usuario) {
	console.log("ERROR: No se especifico usuario");
	console.log("# node bin/server.js --usuario=Nombre");
	process.exit(-1);
}

var puerto = 3000;
iniciar_servidor(puerto);
publicar_servidor();
