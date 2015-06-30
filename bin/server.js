var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var local_ip = require('my-local-ip')()
var spawn = require('child_process').spawn;
var jugadores = {};
var MAX_JUGADORES = 2;
var FILE_MAZO = '../src/mazo.json';
var FILE_LOGGER = '/tmp/log-servidor.txt';
var MAX_RESPUESTAS_DIFIRENTES = 0;
var PUERTO = 3000;

function conectado(socket)
{
    var jugador_ip = socket.handshake.address;
    console.log("Se unio un jugador en " + jugador_ip);
}

function desconectado(socket)
{
    var jugador_ip = socket.handshake.address;
    console.log("Se fue un jugador en " + jugador_ip + "\n");
}

function iniciar_servidor(PUERTO)
{
//    var jugadores = [];
//    var mazo_jugador1 = [];
//    var mazo_jugador2 = [];
//    var respuestas = [];

    var resultados = [];
    var indice = 0;
    var respuestaCorrecta;
    
//    var max_respuestas_diferentes = 0;
//
//    var historico_respuestas = [];
//    var opcion_respuestas = [];
//    var obj_ip_jugador = {};
//    var obj_cartas_jugador = {};
//    obj_cartas_jugador['empate'] = 0;
//    obj_cartas_jugador['eliminadas'] = 0;
//    var cartas_guerra = 0;

    io.on('connection', function (socket) {
        console.log('connection');
        socket.on('respuesta', function (opcion) {
            console.log(JSON.stringify(opcion, null, 2));
            
            
//        this.respuestaCorrecta = "";
//        if (jugadores.jugador1.mazo[this.indice].lados > jugadores.jugador2.mazo[this.indice].lados) {
//            this.respuestaCorrecta = "jugador1";
//        } else if (jugadores.jugador1.mazo[this.indice].lados < jugadores.jugador2.mazo[this.indice].lados) {
//            this.respuestaCorrecta = "jugador2";
//        } else {
//            this.respuestaCorrecta = "empate";
//        }
//        
//        this.resultados[this.indice] = { respuestaCorrecta: this.respuestaCorrecta };
//        this.resultados[this.indice][opcion.jugador] = opcion.respuesta;
//        
//        // Tengo ambas respuestas //
//        if(this.resultados[this.indice].jugador1 && this.resultados[this.indice].jugador2) {
//            // Respuestas iguales //
//            if(this.resultados[this.indice].jugador1.respuesta == this.resultados[this.indice].jugador2.respuesta) {
//                logger.write('Respuestas iguales.', 'respuestaJugadores');
//                // Empate = Guerra //
//                if(this.resultados[this.indice].jugador1.respuesta == 'empate') {
//                    logger.write('Empate = Guerra.', 'respuestaJugadores');
//                    jugadores.addContadorGuerra();
//                } else {
//                    logger.write('Respuestas iguales.', 'respuestaJugadores');
//
//                    jugadores.addContadorJugador(JUGAs);
//                }
//                
//                
//                if (opcion_respuestas[0] == 'empate') {
//                    console.log('Aca hay guerra');
//                    cartas_guerra++;
//                    obj_cartas_jugador['empate']++;
//                } else {
//                    console.log('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);
//                    if (cartas_guerra) {
//                        logger.write('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
//                        obj_cartas_jugador[opcion_respuestas[0]] += cartas_guerra;
//                        cartas_guerra = 0;
//                    }
//                    obj_cartas_jugador[opcion_respuestas[0]]++;
//                }
//
//        historico_respuestas.push({"respuesta_real": respuesta_real, "respuesta_jugadores": opcion_respuestas[0], "lados_jugador1": lados_j1, "lados_jugador2": lados_j2, "img_j1": img_j1, "img_j2": img_j2});
//    } else {
//        console.log('Las respuestas difieren\nRepregunto');
//        i--; //Decremento para que vuelva a enviar la misma mano al emitir
//    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
//            //respuestas.push(jugador_ip);
//            opcion_respuestas.push(opcion);
//            //console.log('Tengo '+respuestas.length+' respuestas');
//            console.log(jugador_ip + ' = ' + JSON.stringify(opcion, null, 2));
//            if (respuestas.length == 2) {
//                console.log('Tengo ambas respuestas');

		/*
                var lados_j1 = 0;
                var lados_j2 = 0;

                var img_j1 = 0;
                var img_j2 = 0;

                if (mazo_jugador1[i].lados > mazo_jugador2[i].lados) {
                    respuesta_real = "jugador1";
                } else if (mazo_jugador1[i].lados < mazo_jugador2[i].lados) {
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

                if (opcion_respuestas[0] == opcion_respuestas[1]) { //Jugador1 y Jugador2 opinan lo mismo
                    if (opcion_respuestas[0] == 'empate') {
                        console.log('Aca hay guerra');
                        cartas_guerra++;
                        obj_cartas_jugador['empate']++;
                    } else {
                        console.log('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);

                        if (cartas_guerra) {
                            console.log('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
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

                if (i == 23) {
                    console.log('Ya se repartieron todas las cartas');
                    console.log('Se muestra historico de respuestas');
                    console.log(historico_respuestas);

                    console.log('El jugador1 uno tiene ' + obj_cartas_jugador.jugador1 + ' cartas');
                    console.log('El jugador2 uno tiene ' + obj_cartas_jugador.jugador2 + ' cartas');
                    console.log('Hubo ' + obj_cartas_jugador.empate + ' empatadas');
                    io.emit('fin', historico_respuestas);
                    i = 0;
                    return;
                }

                console.log("=======================================================================");
                i++;
                console.log('Se juega ahora la mano ' + i);
                io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": obj_cartas_jugador.jugador1, "contador_jugador2": obj_cartas_jugador.jugador2, "contador_guerra": cartas_guerra});
                respuestas = [];
                opcion_respuestas = [];
	*/
//            }
        });

        if (get_jugadores_count(jugadores) >= MAX_JUGADORES) {
            console.log('Se conecto el maximo de jugadores: ' + jugadores);
            return;
        }
        
        var jugador_ip = socket.handshake.address;
        var jugadorNumero = socket.handshake.query.nro_jugador;
        var nombre_jugador = socket.handshake.query.nombre_jugador;

        jugadores[jugadorNumero] = { nombre: nombre_jugador, ip: jugador_ip, contador: 0, mazo: [] };
        //jugadores++;
        console.log('Hay conectados '+ get_jugadores_count(jugadores) +' jugadores');
        conectado(socket);
//        jugadores.push(jugador_ip);
//        obj_cartas_jugador[nombre_jugador] = 0;
//        obj_ip_jugador[nombre_jugador] = jugador_ip;
//        //jugadores++;
//        console.log('Hay conectados ' + get_jugadores_count(jugadores) + ' jugadores');
//        conectado(socket);
        if (get_jugadores_count(jugadores) == MAX_JUGADORES) {
            console.log("Ya tenemos a todos los jugadores");
            console.log("Arrancamos el juego");
            repartir_cartas(jugadores);
            io.emit('listo', get_jugadores(jugadores));
            console.log('Se juega ahora la mano ' + indice);
            io.emit('mano', get_mano(jugadores, indice));
//            io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": 0, "contador_jugador2": 0, "contador_guerra": 0});
        }

        socket.on('disconnect', function () {
	/*
            var index = jugadores.indexOf(jugador_ip);
            jugadores.splice(index, 1);
            io.emit('retiro', jugador_ip);
            desconectado(socket);
            console.log('Hay conectados ' + get_jugadores_count(jugadores) + ' jugadores');
	*/
        });
    });

    http.listen(PUERTO, function () {
        console.log('Esperando jugadores en ' + PUERTO);
    });
}

function get_jugadores(jugadores) {
    return {
        jugador1: { nro_jugador: 'jugador1', nombre: jugadores.jugador1.nombre, ip: jugadores.jugador1.ip, contador: 0 },
        jugador2: { nro_jugador: 'jugador2', nombre: jugadores.jugador2.nombre, ip: jugadores.jugador2.ip, contador: 0 },
    };
}

function get_jugadores_count(jugadores) {
    return Object.keys(jugadores).length;
}

function get_mano(jugadores, i) {
    return {
        jugador1: { nro_jugador: 'jugador1', carta: jugadores.jugador1.mazo[i], contador: jugadores.jugador1.contador },
        jugador2: { nro_jugador: 'jugador2', carta: jugadores.jugador2.mazo[i], contador: jugadores.jugador2.contador },
        contadorGuerra: 0
    }
}

function repartir_cartas(jugadores) {
    var Mazo = require(FILE_MAZO);
    mazo_completo = Mazo.mazo.concat(Mazo.mazo);
    mazo_jugador1 = [];
    mazo_jugador2 = [];

    for (var k = 0; k < Mazo.mazo.length; k++) {
        var id_carta_jugador1 = Math.floor(Math.random() * mazo_completo.length);
        var carta_jugador1 = mazo_completo[id_carta_jugador1];
        mazo_jugador1.push(carta_jugador1);
        mazo_completo.splice(id_carta_jugador1, 1);

        var id_carta_jugador2 = Math.floor(Math.random() * mazo_completo.length);
        var carta_jugador2 = mazo_completo[id_carta_jugador2];
        mazo_jugador2.push(carta_jugador2);
        mazo_completo.splice(id_carta_jugador2, 1);
    }
    jugadores.jugador1.mazo = mazo_jugador1;
    jugadores.jugador2.mazo = mazo_jugador2;
}

function publicar_servidor()
{
    cliente = spawn('avahi-publish-service', [ '-s', 'huayra_mxt-' + local_ip + '-' + usuario, '_http._tcp', PUERTO ]);
    cliente.stdout.on('data', function (data) {
        //console.log("stderr", data);
    });

    cliente.on('error', function (codigo) {
        console.error("ERROR: no se puede ejecutar avahi-publish-service", codigo);
    });

    cliente.on('exit', function (codigo) {
        if (codigo) {
            console.log("Error, el comando retorno: " + codigo);
        } else {
            console.log("ha finalizado el comando avahi-publish-service");
        }
    });
}

var usuario;
process.argv.forEach(function (val, index, array) {
    if (/--usuario=/.test(val)) {
        usuario = val.split('=')[1];
    }
});

if (!usuario) {
    console.log("ERROR: No se especifico usuario");
    console.log("# node bin/server.js --usuario=Nombre");
    process.exit(-1);
}

iniciar_servidor(PUERTO);
publicar_servidor();
