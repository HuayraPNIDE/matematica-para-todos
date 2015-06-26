var PUERTO = 3000;
var IMG_CARPETA = 'img/';
var IMG_NOMBRE = 'carta_';
var IMG_EXTENSION = '.png';

var Servidor = function(nombre) {
    spawn = require('child_process').spawn;
    spawn('nodejs', ['../bin/server.js', "--usuario="+nombre]);
};

var Conexion = function (ip, nroJugador, nombreJugador) {
    socket = io("http://" + ip + ":" + PUERTO + "/", {query: 'nro_jugador=' + nroJugador + "&nombre_jugador=" + nombreJugador});
    
//    var self = this;
//    this.registrarEspera = function() {
        socket.on('connect', function () {
            
//            console.log('Me conecte al servidor');
            socket.on('listo', function (o) {
                $("#amigos").hide();
                $("#titulo").html('A Jugar!!!');
                $(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
                $(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
                $(".juego").show();
            });
//
//            socket.on('retiro', function (msg) {
//                $("#titulo").html(msg + ' Se retiro <br> Es el fin del juego');
//                $(".juego").hide();
//                socket.disconnect();
//            });
//
//            socket.on('fin', function (resultados) {
//                $("#titulo").html('Es el fin del juego <br> Estos son los resultados');
//                $(".juego").hide();
//                socket.disconnect();
//            });
//
            socket.on('mano', function (o) {
                console.log("mano");
                setInterval(function(){
                    socket.emit('respuesta', {llave: nroJugador});
//                    console.log("Cada 2.5 segundos" + JSON.stringify(socket, null, 2));
                    console.log("Cada 2.5 segundos");
                    console.dir(socket);
                }, 2500);

//                console.log('Desde el server me llegan cartas:');
//                console.log(JSON.stringify(o, null, 2));
//                
                // Contador
                if(o.jugador1.contador || $(".jugador1 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
                    $(".jugador1 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
                }
                $(".jugador1 .contador figcaption").html(o.jugador1.contador);
                
                if(o.jugador2.contador || $(".jugador2 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
                    $(".jugador2 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
                }
                $(".jugador2 .contador figcaption").html(o.jugador2.contador);
//                
//                // Cartas
//                $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + IMG_EXTENSION);
//                $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + IMG_EXTENSION);
//                // Cuando hay Guerra
//                if(o.contador_guerra) {
//                    $("#mano .guerra .contador figcaption").html(o.contador_guerra);
//                }
//                
//                $("#mano .respuesta").on('click', function() {
//                    // Deshabilita cartas //
//                    $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + '_deshabilitado' + IMG_EXTENSION);
//                    $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + '_deshabilitado' + IMG_EXTENSION);
//                    // Envia la selección //
//                    socket.emit('respuesta', { jugador: nroJugador, respuesta: $(this).find('img').prop('class') });
//                    $("#mano .respuesta").off('click');
//                });
                
                $("#mano").show();
            });
        });
//    };
};

var Cliente = function(nombre, avatar) {
    this.nombre = nombre;
    this.avatar = avatar;
    this.localIp = require('my-local-ip')();
    this.init = function() {
        conexionServidorLocal = new Conexion(this.localIp, 'jugador1', this.nombre);
        $("#avatar").hide();
        $("#actualizar, #amigos").show();
//        conexionServidorLocal.registrarEspera();
    }
};

var Amigos = function () {
    this.amigos = {};
    this.buscar = function() {
        this.spawn = require('child_process').spawn;
        this.proceso = this.spawn("avahi-browse", ['-a', '-r', '-p', '--ignore-local']);
        this.lineas;
        var self = this;

        this.proceso.stdout.on("data", function (chunk) {
            this.lineas = ("" + chunk).split("\n");
            for (i = 0; this.lineas.length > i; i++) {
                if (/huayra_mxt/.test(this.lineas[i])) {
                    campos = this.lineas[i].split(";");

                    // tipo
                    if (campos[0] == '=') {
                        ip = campos[3].split('-')[1].replace(/\\/gi, "");
                        nombre = campos[3].split('-')[2];
                        self.amigos[ip] = nombre;
                    }

                    if (campos[0] == '-') {
                        ip = campos[3].split('-')[1].replace(/\\/gi, "");
                        delete self.amigos[ip];
                    }
                }
            }
        });
    },
    this.actualizarVista = function(cliente) {
        var self = this;
        e = $("<div></div>");
        for (var k in this.amigos) {
            amigo = this.amigos[k];
            tmp = '<div class="media thumbnail" data-ip="' + k + '"> \
              <div class="media-left"><a href="#"><img class="media-object" src="img/avatar-neutro.png" width="81" height="86"></a></div> \
              <div class="media-body"><h4 class="media-heading">' + this.amigos[k] + '</h4></div> \
            </div>';

            $(e).append($(tmp).on('click', function() {
                self.elegir($(this).data('ip'), cliente.nombre);
            }));
        }
        $('#listado').html(e);
        $('#listado').show();
    },
    this.elegir = function(ip, nombreJugador) { // Se conecta al Servidor elegido //
        conexionAlServidor = new Conexion(ip, 'jugador2', nombreJugador);
//        conexionAlServidor.registrarEspera();
    }
};


function enviarla() {
    
}