var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var local_ip = require('my-local-ip')()
var spawn = require('child_process').spawn;
var contadorGuerra = 0;
var jugadores = {};
var MAX_JUGADORES = 2;
var FILE_MAZO = '../src/mazo.json';
var Mazo = require(FILE_MAZO);
var FILE_LOGGER = '/tmp/log-servidor.txt';
var MAX_RESPUESTAS_DIFIRENTES = 0;
var PUERTO = 3000;

function conectado(socket) {
    var jugador_ip = socket.handshake.address;
    console.log("Se unio un jugador en " + jugador_ip);
}

function desconectado(socket) {
    var jugador_ip = socket.handshake.address;
    console.log("Se fue un jugador en " + jugador_ip + "\n");
}

function iniciar_servidor(PUERTO) {
//    var respuestas = [];
    var resultados = [];
    var indice = 0;
    var respuestaCorrecta;
    var respuestaAuxiliar = {};
    
    io.on('connection', function (socket) {
        console.log('connection');
        socket.on('respuesta', function (opcion) {
            if(indice >= Mazo.mazo.length) {
                console.log("Mostrar la tabla de resultados.");
                io.emit('tabla', resultados);
            }
            respuestaAuxiliar[opcion.nro_jugador] = opcion.respuesta;
            // Tengo ambas respuestas //
            if(respuestaAuxiliar.jugador1 && respuestaAuxiliar.jugador2) {
                console.log("Tengo ambas respuestas");
                respuestaCorrecta = "";
                if (jugadores.jugador1.mazo[indice].lados > jugadores.jugador2.mazo[indice].lados) {
                    respuestaCorrecta = "jugador1";
                } else if (jugadores.jugador1.mazo[indice].lados < jugadores.jugador2.mazo[indice].lados) {
                    respuestaCorrecta = "jugador2";
                } else {
                    respuestaCorrecta = "empate";
                }
                
                respuestaAuxiliar.respuestaCorrecta = respuestaCorrecta;
                resultados[indice] = respuestaAuxiliar;
            
                // Respuestas iguales //
                if(resultados[indice].jugador1 == resultados[indice].jugador2) {
                    console.log('Respuestas iguales.');
                    // Empate = Guerra //
                    if(resultados[indice].jugador1 == 'empate') {
                        console.log('Empate = Guerra.');
                        add_contador_guerra();
                    } else {
                        console.log('Respuestas iguales.');
                        add_contador_jugador(resultados[indice].jugador1); // Envia jugador1 porque es inditinto ya que eligieron la misma respuesta //
                    }
                    indice++;
                } else {
                    console.log('Las respuestas difieren\nRepregunto');
                    indice--; // Decremento para que vuelva a enviar la misma mano al emitir
                }
                respuestaAuxiliar = {};
                console.log('Se juega ahora la mano: ' + indice);
                io.emit('mano', get_mano(jugadores, indice));
            }
        });

        if (get_jugadores_count(jugadores) >= MAX_JUGADORES) {
            console.log('Se conecto el maximo de jugadores: ' + jugadores);
            return;
        }
        
        var jugador_ip = socket.handshake.address;
        var jugadorNumero = socket.handshake.query.nro_jugador;
        var nombre_jugador = socket.handshake.query.nombre_jugador;

        jugadores[jugadorNumero] = { nombre: nombre_jugador, ip: jugador_ip, contador: 0, mazo: [] };
        console.log('Hay conectados '+ get_jugadores_count(jugadores) +' jugadores');
        conectado(socket);
        if (get_jugadores_count(jugadores) == MAX_JUGADORES) {
            console.log("Ya tenemos a todos los jugadores");
            console.log("Arrancamos el juego");
            jugadores.contadorGuerra = contadorGuerra;
            repartir_cartas(jugadores);
            io.emit('listo', get_jugadores(jugadores));
            console.log('Se juega ahora la mano: ' + indice);
            io.emit('mano', get_mano(jugadores, indice));
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
        jugador1: { nro_jugador: 'jugador1', nombre: jugadores.jugador1.nombre, ip: jugadores.jugador1.ip, contador: jugadores.jugador1.contador },
        jugador2: { nro_jugador: 'jugador2', nombre: jugadores.jugador2.nombre, ip: jugadores.jugador2.ip, contador: jugadores.jugador2.contador },
    };
}

function get_jugadores_count(jugadores) {
    return Object.keys(jugadores).length;
}

function get_mano(jugadores, indice) {
    return {
        jugador1: { nro_jugador: 'jugador1', carta: jugadores.jugador1.mazo[indice], contador: jugadores.jugador1.contador },
        jugador2: { nro_jugador: 'jugador2', carta: jugadores.jugador2.mazo[indice], contador: jugadores.jugador2.contador },
        contadorGuerra: jugadores.contadorGuerra
    }
}

function add_contador_guerra() {
    contadorGuerra++;
}

function exist_guerra() {
    return contadorGuerra ? true : false;
}

function add_contador_jugador(jugador) {
    if(exist_guerra()) {
        console.log('Habia ' + contadorGuerra + ' retenidas por guerra.');
        jugadores[jugador].contador += contadorGuerra;
        contadorGuerra = 0;
    }
    jugadores[jugador].contador++;
}


function repartir_cartas(jugadores) {
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
