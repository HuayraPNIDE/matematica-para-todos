 
 var MAX_JUGADORES = 2;
 var FILE_MAZO = '../src/mazo.json';
 var MAX_RESPUESTAS_DIFIRENTES = 0;

 console.log(__filename);
 
var Jugadores = function () {
    this.jugadores = {};
    this.nuevoJugador = function (jugadorNro, jugadorNombre, jugadorIp) {
        this.jugadores[jugadorNro] = {nombre: jugadorNombre, ip: jugadorIp, contador: '', mazo: []};
    },
    this.getJugadoresCount = function () {
        return Object.keys(this.jugadores).length;
    },
    this.getJugadores = function() {
        return {
            jugador1: {nombre: this.jugadores.jugador1.nombre, ip: this.jugadores.jugador1.ip },
            jugador2: {nombre: this.jugadores.jugador2.nombre, ip: this.jugadores.jugador2.ip },
        };
    },
    this.getMano = function(i) {
        return {
            jugador1: {carta: this.jugadores.jugador1.mazo[i], contador: 0},
            jugador2: {carta: this.jugadores.jugador2.mazo[i], contador: 0},
            contador_guerra: 0
        };
    }
};
 
var Juego = function (io, socket, jugadores) {
    this.respuestaCorrecta;
    this.i=0;
    cartas = new Mazo();
    cartas.repartir(jugadores.jugadores);
    this.jugar = function() {
//console.log(JSON.stringify(jugadores, null,2 ));
        io.emit('listo', jugadores.getJugadores());
        io.emit('mano', jugadores.getMano(this.i++));
        socket.on('respuesta', function(opcion) {this.respuestaJugadores(opcion)});
//        this.io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": 0, "contador_jugador2": 0, "contador_guerra": 0});
    },
    this.respuestaJugadores = function(opcion) {
        this.respuestaCorrecta = "";
        if (jugadores.jugador1.mazo[i].lados > jugadores.jugador2.mazo[i].lados) {
            this.respuestaCorrecta = "jugador1";
        } else if (jugadores.jugador1.mazo[i].lados < jugadores.jugador2.mazo[i].lados) {
            this.respuestaCorrecta = "jugador2";
        } else {
            this.respuestaCorrecta = "empate";
        }
        
        
//        socket.on('respuesta', function (opcion) {
//            respuestas.push(jugador_ip);
//
//            opcion_respuestas.push(opcion);
//
//            //console.log('Tengo '+respuestas.length+' respuestas');
//            console.log(jugador_ip + ' = ' + opcion);
//            logger.write(jugador_ip + ' = ' + opcion);
//            if (respuestas.length == 2) {
//                console.log('Tengo ambas respuestas');
//                logger.write('Tengo ambas respuestas');
//
//                var lados_j1 = 0;
//                var lados_j2 = 0;
//
//                var img_j1 = 0;
//                var img_j2 = 0;
//
//                if (mazo_jugador1[i].lados > mazo_jugador2[i].lados) {
//                    respuesta_real = "jugador1";
//                } else if (mazo_jugador1[i].lados < mazo_jugador2[i].lados) {
//                    respuesta_real = "jugador2";
//                } else {
//                    respuesta_real = "empate";
//                }
//
//                lados_j1 = mazo_jugador1[i].lados;
//                lados_j2 = mazo_jugador2[i].lados;
//
//                img_j1 = mazo_jugador1[i].img;
//                img_j2 = mazo_jugador2[i].img;
//
//                console.log("Opcion real:" + respuesta_real);
//                console.log("Opciones jugadores: " + opcion_respuestas);
//                logger.write("Opcion real:" + respuesta_real);
//                logger.write("Opciones jugadores: " + opcion_respuestas);
//
//                // Jugador1 y Jugador2 opinan lo mismo //
//                if (opcion_respuestas[0] == opcion_respuestas[1]) {
//                    if (opcion_respuestas[0] == 'empate') {
//                        console.log('Aca hay guerra');
//                        logger.write('Aca hay guerra');
//                        cartas_guerra++;
//                        obj_cartas_jugador['empate']++;
//                    } else {
//                        console.log('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);
//                        logger.write('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);
//
//                        if (cartas_guerra) {
//                            console.log('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
//                            logger.write('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
//                            obj_cartas_jugador[opcion_respuestas[0]] += cartas_guerra;
//                            cartas_guerra = 0;
//                        }
//                        obj_cartas_jugador[opcion_respuestas[0]]++;
//                    }
//
//                    historico_respuestas.push({"respuesta_real": respuesta_real, "respuesta_jugadores": opcion_respuestas[0], "lados_jugador1": lados_j1, "lados_jugador2": lados_j2, "img_j1": img_j1, "img_j2": img_j2});
//                } else {
//                    console.log('Las respuestas difieren\nRepregunto');
//                    logger.write('Las respuestas difieren\nRepregunto');
//                    i--; //Decremento para que vuelva a enviar la misma mano al emitir
//                }
//
//                if (i == 23) {
//                    console.log('Ya se repartieron todas las cartas');
//                    console.log('Se muestra historico de respuestas');
//                    console.log(historico_respuestas);
//                    logger.write('Ya se repartieron todas las cartas');
//                    logger.write('Se muestra historico de respuestas');
//                    logger.write(historico_respuestas);
//
//                    console.log('El jugador1 uno tiene ' + obj_cartas_jugador.jugador1 + ' cartas');
//                    console.log('El jugador2 uno tiene ' + obj_cartas_jugador.jugador2 + ' cartas');
//                    console.log('Hubo ' + obj_cartas_jugador.empate + ' empatadas');
//                    logger.write('El jugador1 uno tiene ' + obj_cartas_jugador.jugador1 + ' cartas');
//                    logger.write('El jugador2 uno tiene ' + obj_cartas_jugador.jugador2 + ' cartas');
//                    logger.write('Hubo ' + obj_cartas_jugador.empate + ' empatadas');
//                    io.emit('fin', historico_respuestas);
//                    i = 0;
//                    return;
//                }
//
//                console.log("=======================================================================");
//                logger.write("=======================================================================");
//                i++;
//                console.log('Se juega ahora la mano ' + i);
//                logger.write('Se juega ahora la mano ' + i);
//                io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": obj_cartas_jugador.jugador1, "contador_jugador2": obj_cartas_jugador.jugador2, "contador_guerra": cartas_guerra});
//                respuestas = [];
//                opcion_respuestas = [];
//            }
//        });
//
//        var jugador_ip = socket.handshake.address;
//        var nombre_jugador = socket.handshake.query.nombre_jugador;
//
//        if (nombre_jugador == 'jugador1') { //Hack
//            nombre_jugador = usuario;
//        }
//
//        jugadores.push(jugador_ip);
//
//        obj_cartas_jugador[nombre_jugador] = 0;
//
//        obj_ip_jugador[nombre_jugador] = jugador_ip;
//
//        //jugadores++;
//        console.log('Hay conectados ' + jugadores.length + ' jugadores');
//        logger.write('Hay conectados ' + jugadores.length + ' jugadores');
//        conectado(socket);
//
//        if (jugadores.length == MAX_JUGADORES) {
//            REPARTIJA
//            io.emit('listo', obj_ip_jugador); //Evento para armar interfaz de los clientes
//            console.log('Se juega ahora la mano ' + i);
//            logger.write('Se juega ahora la mano ' + i);
//            io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": 0, "contador_jugador2": 0, "contador_guerra": 0});
//        }
//    });


    }
};

var Mazo = function () {
    this.mazo = require(FILE_MAZO);
    this.mazoCompleto = this.mazo.concat(this.mazo);
    this.repartir = function(jugadores) {
        mazo_jugador1 = [];
        mazo_jugador2 = [];
        for (var k = 0; k < this.mazo.length; k++) {
            var id_carta_jugador1 = Math.floor(Math.random() * this.mazoCompleto.length);
            var carta_jugador1 = this.mazoCompleto[id_carta_jugador1];
            mazo_jugador1.push(carta_jugador1);
            this.mazoCompleto.splice(id_carta_jugador1, 1);

            var id_carta_jugador2 = Math.floor(Math.random() * this.mazoCompleto.length);
            var carta_jugador2 = this.mazoCompleto[id_carta_jugador2];
            mazo_jugador2.push(carta_jugador2);
            this.mazoCompleto.splice(id_carta_jugador2, 1);
        }
        jugadores.jugador1.mazo = mazo_jugador1;
        jugadores.jugador2.mazo = mazo_jugador2;
    }
};

var Servidor = function (puerto) {
    this.app = require('express')();
    this.http = require('http').Server(this.app);
    this.io = require('socket.io')(this.http);
    this.jugadores = new Jugadores();
    this.puerto = puerto;
    
    this.http.listen(this.puerto, function () {
        logger.write('Esperando jugadores en ' + puerto);
    });
    
    this.publicar = function() {
        var usuario;
        this.localIp = require('my-local-ip')();
        process.argv.forEach(function (val, index, array) {
            if (/--usuario=/.test(val)) {
                usuario = val.split('=')[1];
            }
        });
        spawn = require('child_process').spawn;
        spawn('avahi-publish-service', ['-s', 'huayra_mxt-' + this.localIp + '-' + usuario, '_http._tcp', this.puerto]);
    },
    this.registrarEspera = function () {
        var self = this;
        this.io.on('connection', function (socket) {
            jugadoresCount = self.jugadores.getJugadoresCount();
            if (jugadoresCount > MAX_JUGADORES) {
                logger.write("Se alcanzaron el máximo de jugadores");
                return;
            }
            logger.write('Se conecto un nuevo jugador');
            jugadorNro = socket.handshake.query.nro_jugador;
            jugadorNombre = socket.handshake.query.nombre_jugador;
            jugadorIp = socket.handshake.address;
            self.jugadores.nuevoJugador(jugadorNro, jugadorNombre, jugadorIp);
            logger.write("jugadorNro: " + jugadorNro + ", jugadorNombre: " + jugadorNombre + ", jugadorIp: " + jugadorIp);
            jugadoresCount = self.jugadores.getJugadoresCount();
            logger.write('Hay conectados ' + jugadoresCount + ' jugadores');
            
            if(jugadoresCount == MAX_JUGADORES) {
                logger.write("Empezamos a jugar");
                juego = new Juego(self.io, socket, self.jugadores);
                juego.jugar();
            }
        });
    }
};

/*
 var app = require('express')();
 var fs = require('fs');
 var http = require('http').Server(app);
 var io = require('socket.io')(http);
 var local_ip = require('my-local-ip')()
 var spawn = require('child_process').spawn;
 
 var puerto = 3000;
 var MAX_JUGADORES = 2;
 var MAX_RESPUESTAS_DIFIRENTES = 0;
 var usuario;
 var jugadores = [];
 
 function conectado(socket) {
 var jugador_ip = socket.handshake.address;
 console.log("Se unio un jugador en " + jugador_ip);
 logger.write("Se unio un jugador en " + jugador_ip);
 }
 
 function desconectado(socket) {
 var jugador_ip = socket.handshake.address;
 console.log("Se fue un jugador en " + jugador_ip + "\n");
 logger.write("Se fue un jugador en " + jugador_ip);
 }
 
 function iniciar_servidor(puerto) {
 
 var mazo_jugador1 = [];
 var mazo_jugador2 = [];
 
 var respuestas = [];
 var i = 0;
 
 var historico_respuestas = [];
 var opcion_respuestas = [];
 var obj_ip_jugador = {};
 var obj_cartas_jugador = {};
 obj_cartas_jugador['empate'] = 0;
 obj_cartas_jugador['eliminadas'] = 0;
 var cartas_guerra = 0;
 
 io.on('connection', function (socket) {
 socket.on('respuesta', function (opcion) {
 respuestas.push(jugador_ip);
 
 opcion_respuestas.push(opcion);
 
 //console.log('Tengo '+respuestas.length+' respuestas');
 console.log(jugador_ip + ' = ' + opcion);
 logger.write(jugador_ip + ' = ' + opcion);
 if (respuestas.length == 2) {
 console.log('Tengo ambas respuestas');
 logger.write('Tengo ambas respuestas');
 
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
 logger.write("Opcion real:" + respuesta_real);
 logger.write("Opciones jugadores: " + opcion_respuestas);
 
 // Jugador1 y Jugador2 opinan lo mismo //
 if (opcion_respuestas[0] == opcion_respuestas[1]) {
 if (opcion_respuestas[0] == 'empate') {
 console.log('Aca hay guerra');
 logger.write('Aca hay guerra');
 cartas_guerra++;
 obj_cartas_jugador['empate']++;
 } else {
 console.log('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);
 logger.write('Las respuestas son iguales, la cartas es para ' + opcion_respuestas[0]);
 
 if (cartas_guerra) {
 console.log('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
 logger.write('Hay ' + cartas_guerra + ' retenidas por guerra\nSe las queda ' + opcion_respuestas[0]);
 obj_cartas_jugador[opcion_respuestas[0]] += cartas_guerra;
 cartas_guerra = 0;
 }
 obj_cartas_jugador[opcion_respuestas[0]]++;
 }
 
 historico_respuestas.push({"respuesta_real": respuesta_real, "respuesta_jugadores": opcion_respuestas[0], "lados_jugador1": lados_j1, "lados_jugador2": lados_j2, "img_j1": img_j1, "img_j2": img_j2});
 } else {
 console.log('Las respuestas difieren\nRepregunto');
 logger.write('Las respuestas difieren\nRepregunto');
 i--; //Decremento para que vuelva a enviar la misma mano al emitir
 }
 
 if (i == 23) {
 console.log('Ya se repartieron todas las cartas');
 console.log('Se muestra historico de respuestas');
 console.log(historico_respuestas);
 logger.write('Ya se repartieron todas las cartas');
 logger.write('Se muestra historico de respuestas');
 logger.write(historico_respuestas);
 
 console.log('El jugador1 uno tiene ' + obj_cartas_jugador.jugador1 + ' cartas');
 console.log('El jugador2 uno tiene ' + obj_cartas_jugador.jugador2 + ' cartas');
 console.log('Hubo ' + obj_cartas_jugador.empate + ' empatadas');
 logger.write('El jugador1 uno tiene ' + obj_cartas_jugador.jugador1 + ' cartas');
 logger.write('El jugador2 uno tiene ' + obj_cartas_jugador.jugador2 + ' cartas');
 logger.write('Hubo ' + obj_cartas_jugador.empate + ' empatadas');
 io.emit('fin', historico_respuestas);
 i = 0;
 return;
 }
 
 console.log("=======================================================================");
 logger.write("=======================================================================");
 i++;
 console.log('Se juega ahora la mano ' + i);
 logger.write('Se juega ahora la mano ' + i);
 io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": obj_cartas_jugador.jugador1, "contador_jugador2": obj_cartas_jugador.jugador2, "contador_guerra": cartas_guerra});
 respuestas = [];
 opcion_respuestas = [];
 }
 });
 
 if (jugadores.length >= MAX_JUGADORES) {
 console.log('Se conecto el maximo de jugadores: ' + jugadores);
 logger.write('Se conecto el maximo de jugadores: ' + jugadores);
 return;
 }
 
 var jugador_ip = socket.handshake.address;
 var nro = socket.handshake.query.nombre_jugador;
 
 if (nombre_jugador == 'jugador1') { //Hack
 nombre_jugador = usuario;
 }
 
 jugadores.push(jugador_ip);
 
 obj_cartas_jugador[nombre_jugador] = 0;
 
 obj_ip_jugador[nombre_jugador] = jugador_ip;
 
 //jugadores++;
 console.log('Hay conectados ' + jugadores.length + ' jugadores');
 logger.write('Hay conectados ' + jugadores.length + ' jugadores');
 conectado(socket);
 
 if (jugadores.length == MAX_JUGADORES) {
 console.log("\nYa tenemos a todos los jugadores");
 console.log("Arrancamos el juego");
 console.log(JSON.stringify(obj_cartas_jugador, null, 2));
 logger.write("\nYa tenemos a todos los jugadores");
 logger.write("Arrancamos el juego");
 logger.write(JSON.stringify(obj_cartas_jugador, null, 2));
 
 var mazo = require('../src/mazo.json');
 var mazo_completo = mazo;
 mazo_completo = mazo_completo.concat(mazo);
 
 for (var k = 0; k < 24; k++) {
 var id_carta_jugador1 = Math.floor(Math.random() * mazo_completo.length);
 var carta_jugador1 = mazo_completo[id_carta_jugador1];
 mazo_jugador1.push(carta_jugador1);
 mazo_completo.splice(id_carta_jugador1, 1);
 
 var id_carta_jugador2 = Math.floor(Math.random() * mazo_completo.length);
 var carta_jugador2 = mazo_completo[id_carta_jugador2];
 mazo_jugador2.push(carta_jugador2);
 mazo_completo.splice(id_carta_jugador2, 1);
 }
 
 io.emit('listo',io obj_ip_jugador); //Evento para armar interfaz de los clientes
 console.log('Se juega ahora la mano ' + i);
 logger.write('Se juega ahora la mano ' + i);
 io.emit('mano', {"carta1": mazo_jugador1[i], "carta2": mazo_jugador2[i], "contador_jugador1": 0, "contador_jugador2": 0, "contador_guerra": 0});
 }
 
 socket.on('disconnect', function () {
 var index = jugadores.indexOf(jugador_ip);
 jugadores.splice(index, 1);
 io.emit('retiro', jugador_ip);
 desconectado(socket);
 console.log('Hay conectados ' + jugadores.length + ' jugadores');
 logger.write('Hay conectados ' + jugadores.length + ' jugadores');
 });
 });
 
 http.listen(puerto, function () {
 console.log('Esperando jugadores en ' + puerto);
 logger.write('Esperando jugadores en ' + puerto);
 });
 }
 
 function publicar_servidor() {
 cliente = spawn('avahi-publish-service', [ '-s', 'huayra_mxt-' + local_ip + '-' + usuario, '_http._tcp', puerto]);
 
 cliente.stdout.on('data', function (data) {
 //console.log("stderr", data);
 });
 
 cliente.on('error', function (codigo) {
 console.error("ERROR: no se puede ejecutar avahi-publish-service", codigo);
 logger.write("ERROR: no se puede ejecutar avahi-publish-service", codigo);
 });
 
 cliente.on('exit', function (codigo) {
 if (codigo) {
 console.log("Error, el comando retorno: " + codigo);
 logger.write("Error, el comando retorno: " + codigo);
 } else {
 console.log("ha finalizado el comando avahi-publish-service");
 logger.write("ha finalizado el comando avahi-publish-service");
 }
 });
 }
 
 process.argv.forEach(function (val, index, array) {
 if (/--usuario=/.test(val)) {
 usuario = val.split('=')[1];
 }
 });
 
 if (!usuario) {
 console.log("ERROR: No se especifico usuario");
 console.log("# node bin/server.js --usuario=Nombre");
 logger.write("ERROR: No se especifico usuario");
 logger.write("# node bin/server.js --usuario=Nombre");
 process.exit(-1);
 }
 
 //iniciar_servidor(puerto);
 //publicar_servidor();
 
 */
var LoggerFile = function () {
    this.filename = '/tmp/log.txt';
    var fs = require('fs');
    fs.writeFileSync(this.filename, "INICIO\n");
    console.log("INICIO\n");
    this.write = function (data) {
        fs.appendFileSync(this.filename, data + "\n");
        console.log(data + "\n");
    }
    fs.appendFileSync(this.filename, "==========================================\n");
}
var logger = new LoggerFile();

var puerto = 3000;
var servidor = new Servidor(puerto)
servidor.publicar();
servidor.registrarEspera();

