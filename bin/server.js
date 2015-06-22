var MAX_JUGADORES = 2;
var FILE_MAZO = '../src/mazo.json';
var FILE_LOGGER = '/tmp/log-servidor.txt';
var MAX_RESPUESTAS_DIFIRENTES = 0;
var PUERTO = 3000;

if (!String.prototype.repeat) {
    String.prototype.repeat = function (count) {
        'use strict';
        if (this == null) {
            throw new TypeError('can\'t convert ' + this + ' to object');
        }
        var str = '' + this;
        count = +count;
        if (count != count) {
            count = 0;
        }
        if (count < 0) {
            throw new RangeError('repeat count must be non-negative');
        }
        if (count == Infinity) {
            throw new RangeError('repeat count must be less than infinity');
        }
        count = Math.floor(count);
        if (str.length == 0 || count == 0) {
            return '';
        }
// Ensuring count is a 31-bit integer allows us to heavily optimize the
// main part. But anyway, most current (August 2014) browsers can't handle
// strings 1 << 28 chars or longer, so:
        if (str.length * count >= 1 << 28) {
            throw new RangeError('repeat count must not overflow maximum string size');
        }
        var rpt = '';
        for (; ; ) {
            if ((count & 1) == 1) {
                rpt += str;
            }
            count >>>= 1;
            if (count == 0) {
                break;
            }
            str += str;
        }
        return rpt;
    }
}

var Jugadores = function () {
    this.jugadores = {};
    this.contadorGuerra;
    this.nuevoJugador = function (jugador) {
        jugadorNumero = jugador.numero;
        this.jugadores[jugadorNumero] = { nombre: jugador.nombre, ip: jugador.ip, contador: 0, mazo: [] };
    },
    this.getJugadoresCount = function () {
        return Object.keys(this.jugadores).length;
    },
    this.getJugadores = function() {
        return {
            jugador1: { nombre: this.jugadores.jugador1.nombre, ip: this.jugadores.jugador1.ip },
            jugador2: { nombre: this.jugadores.jugador2.nombre, ip: this.jugadores.jugador2.ip },
        };
    },
    this.getMano = function(i) {
        return {
            jugador1: { carta: this.jugadores.jugador1.mazo[i], contador: this.jugadores.jugador1.contador },
            jugador2: { carta: this.jugadores.jugador2.mazo[i], contador: this.jugadores.jugador2.contador },
            contadorGuerra: this.contadorGuerra
        };
    },
    this.addContadorJugador = function(jugador) {
        if(this.existGuerra()) {
            logger.write('Habia ' + this.contadorGuerra + ' retenidas por guerra.', 'respuestaJugadores');
            this.jugadores[jugador].contador += this.contadorGuerra;
            this.contadorGuerra = 0;
        }
        this.jugadores[jugador].contador++;
    },
    this.existGuerra = function() {
        return this.contadorGuerra ? true : false;
    },
    this.addContadorGuerra = function() {
        this.contadorGuerra++;
    }
};
 
var Juego = function (io, socket, jugadores) {
    this.resultados = [];
    this.respuestaCorrecta;
    this.indice=0;
    cartas = new Mazo();
    cartas.repartir(jugadores.jugadores);
    self=this;
    this.jugar = function() {
        logger.write('Jugar.', 'Juego');
        io.emit('listo', jugadores.getJugadores());
        io.emit('mano', jugadores.getMano(this.indice));
        socket.on('respuesta', function(opcion) {
            self.respuestaJugadores(opcion);
        });
    },
    this.respuestaJugadores = function(opcion) {
        logger.write('Jugar.', 'respuestaJugadores');
        this.respuestaCorrecta = "";
        if (jugadores.jugadores.jugador1.mazo[this.indice].lados > jugadores.jugadores.jugador2.mazo[this.indice].lados) {
            this.respuestaCorrecta = "jugador1";
        } else if (jugadores.jugadores.jugador1.mazo[this.indice].lados < jugadores.jugadores.jugador2.mazo[this.indice].lados) {
            this.respuestaCorrecta = "jugador2";
        } else {
            this.respuestaCorrecta = "empate";
        }
        
        this.resultados[this.indice] = { respuestaCorrecta: this.respuestaCorrecta };
        this.resultados[this.indice][opcion.jugador] = opcion.respuesta;

        // Tengo ambas respuestas //
        if(this.resultados[this.indice].jugador1 && this.resultados[this.indice].jugador2) {
            // Respuestas IGUALES //
            if(this.resultados[this.indice].jugador1.respuesta == this.resultados[this.indice].jugador2.respuesta) {
                logger.write('Respuestas iguales.', 'respuestaJugadores');
                // Empate = Guerra //
                if(this.resultados[this.indice].jugador1.respuesta == 'empate') {
                    logger.write('Empate = Guerra.', 'respuestaJugadores');
                    jugadores.addContadorGuerra();
                } else {
                    logger.write('Respuestas iguales.', 'respuestaJugadores');
                    jugadores.addContadorJugador(this.resultados[this.indice].jugador1.respuesta);
                }
                this.indice++;
            } else {
            // Respuestas DIFERENTES //
                logger.write('Las respuestas difieren. Repreguntar.', 'respuestaJugadores');
                this.indice--;
            }
            io.emit('mano', jugadores.getMano(this.indice));
        }
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

var Servidor = function () {
    this.app = require('express')();
    this.http = require('http').Server(this.app);
    this.io = require('socket.io')(this.http);
    this.jugadores = new Jugadores();
   
    try {
        this.http.listen(PUERTO, function () {
            logger.write('Se crea el SERVIDOR. Esperando jugadores en el puerto: ' + PUERTO, 'Servidor');
        });
    } catch (e) {
        console.log(e.name + ": " + e.message);
    }
    
    this.publicar = function() {
        var usuario;
        this.localIp = require('my-local-ip')();
        process.argv.forEach(function (val, index, array) {
            if (/--usuario=/.test(val)) {
                usuario = val.split('=')[1];
            }
        });
        logger.write('avahi-publish-service', 'publicar');
        try {
            spawn = require('child_process').spawn;
            proceso = spawn('avahi-publish-service', ['-s', 'huayra_mxt-' + this.localIp + '-' + usuario, '_http._tcp', PUERTO]);
            proceso.on('error', function(code, signal) {
                console.log("Salio con errorr: [%s] - %s", code, signal);
            });
        } catch (e) {
            console.log(e.name + ": " + e.message);
        }
    },
    this.registrarEspera = function () {
        var self = this;
        this.io.on('connection', function (socket) {
            logger.write('connection', 'registrarEspera');
            if (self.jugadores.getJugadoresCount() > MAX_JUGADORES) {
                logger.write('Se alcanzaron el máximo de jugadores.', 'registrarEspera');
                return;
            }
            logger.write('Se conecto un nuevo jugador.', 'registrarEspera');
            logger.write('nuevoJugador.', 'registrarEspera');
            nuevoJugador = self.queryString(socket);
            self.jugadores.nuevoJugador(nuevoJugador);
            logger.write('Hay conectados ' + self.jugadores.getJugadoresCount() + ' jugadores', 'registrarEspera');
            
            if(self.jugadores.getJugadoresCount() == MAX_JUGADORES) {
                logger.write('Empezamos a jugar.', 'registrarEspera');
                juego = new Juego(self.io, socket, self.jugadores);
                juego.jugar();
            }
	    socket.on('disconnect', function(socket) {
                this.registrarDesconexion(socket);
            });
        });
    },
    this.registrarDesconexion = function(socket) {
        logger.write('Se desconecto un jugador.', 'registrarDesconexion');
        this.queryString(socket);
    },
    this.queryString = function(socket) {
        jugador = {
            numero: socket.handshake.query.nro_jugador,
            nombre: socket.handshake.query.nombre_jugador,
            ip: socket.handshake.address
        };
        logger.write("jugadorNro: " + jugador.numero + ", jugadorNombre: " + jugador.nombre + ", jugadorIp: " + jugador.ip, 'queryString');
        return jugador;
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
    var fs = require('fs');
    fs.appendFileSync(FILE_LOGGER, '='.repeat(50) + '\n');
    fs.appendFileSync(FILE_LOGGER, '='.repeat(20) + '| INICIO |' + '='.repeat(20) + '\n');
    fs.appendFileSync(FILE_LOGGER, '='.repeat(50) + '\n');
    this.write = function (data, ref) {
        if(ref) {
            ref = '[' + ref + '] ';
        }
        fs.appendFileSync(FILE_LOGGER, ref + data + "\n");
        console.log('', 'LoggerFile: ' + ref + data);
    }
    fs.appendFileSync(FILE_LOGGER, '='.repeat(50) + '\n');
    fs.appendFileSync(FILE_LOGGER, '='.repeat(20) + '| FIN |' + '='.repeat(20) + '\n');
    fs.appendFileSync(FILE_LOGGER, '='.repeat(50) + '\n');
}

var logger = new LoggerFile();
var servidor = new Servidor();
servidor.publicar();
servidor.registrarEspera();
