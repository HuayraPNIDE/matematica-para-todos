var PUERTO = 3000;
var IMG_CARPETA = 'img/';
var IMG_NOMBRE = 'carta_';
var IMG_EXTENSION = '.png';

var Servidor = function(nombre) {
    spawn = require('child_process').spawn;
    spawn('nodejs', ['../bin/server.js', "--usuario="+nombre]);
};

var Conexion = function (ip, nroJugador, nombreJugador) {
    var socket = io("http://" + ip + ":" + PUERTO + "/", {query: 'nro_jugador=' + nroJugador + "&nombre_jugador=" + nombreJugador});
    registrar_espera(socket);
//    console.log('Conexion');
    var self = this;
    this.emitir = function() {
        
        // Envia la selección //
//        socket.emit('respuesta', { jugador: nroJugador, respuesta: $(this).find('img').prop('class') });
        socket.emit('respuesta', { jugador: nroJugador, respuesta: "RESPUESTAS!!!!" });
        
//        $("#mano .respuesta").on('click', function() {
//            // Deshabilita cartas //
//            $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + '_deshabilitado' + IMG_EXTENSION);
//            $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + '_deshabilitado' + IMG_EXTENSION);
//            // Envia la selección //
//            socket.emit('respuesta', { jugador: nroJugador, respuesta: $(this).find('img').prop('class') });
//            $("#mano .respuesta").off('click');
//        });
//
    },
    socket.on('connect', function () {
        socket.on('listo', function (o) {
            $("#amigos").hide();
            $("#titulo").html('A Jugar!!!');
            $(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
            $(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
            $(".juego").show();
        });
        socket.on('mano', function (o) {
            // Contador
            if(o.jugador1.contador || $(".jugador1 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
                $(".jugador1 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
            }
            $(".jugador1 .contador figcaption").html(o.jugador1.contador);

            if(o.jugador2.contador || $(".jugador2 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
                $(".jugador2 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
            }
            $(".jugador2 .contador figcaption").html(o.jugador2.contador);

            // Cartas
            $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + IMG_EXTENSION);
            $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + IMG_EXTENSION);
            // Cuando hay Guerra
            if(o.contador_guerra) {
                $("#mano .guerra .contador figcaption").html(o.contador_guerra);
            }
    $("#mano .respuesta").on('click', function() {
        // Deshabilita cartas //
        $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + '_deshabilitado' + IMG_EXTENSION);
        $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + '_deshabilitado' + IMG_EXTENSION);
        
        self.emitir();
        
        $("#mano .respuesta").off('click');
    });
            $("#mano").show();
//            self.respuesta(o);
        });
        
        
    });
//            socket.on('retiro', function (msg) {
//                $("#titulo").html(msg + ' Se retiro <br> Es el fin del juego');
//                $(".juego").hide();
//                socket.disconnect();
//            });
//            socket.on('fin', function (resultados) {
//                $("#titulo").html('Es el fin del juego <br> Estos son los resultados');
//                $(".juego").hide();
//                socket.disconnect();
//            });
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



//
//function registrar_espera(socket) {
//
//    socket.on('connect', function () {
//        console.log('Me conecte al servidor');
//        console.log('Registro eventos:\nlisto\nretiro\nmano');
//
//        socket.on('listo', function (o) {
//            $("#amigos").hide();
//            $("#titulo").html('A Jugar!!!');
//            $(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
//            $(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
//            $(".juego").show();
//        });
//
//        var btn_mano = document.getElementById('btn_mano');
//        socket.on('mano', function (o) {
//            console.log('Desde el server me llegan cartas:');
//            if(o.jugador1.contador || $(".jugador1 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
//                $(".jugador1 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
//            }
//            $(".jugador1 .contador figcaption").html(o.jugador1.contador);
//
//            if(o.jugador2.contador || $(".jugador2 .contador img").prop('src') !=  IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION) {
//                $(".jugador2 .contador img").prop('src', IMG_CARPETA + 'caja_cartas' + IMG_EXTENSION);
//            }
//            $(".jugador2 .contador figcaption").html(o.jugador2.contador);
//
//            // Cartas
//            $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + IMG_EXTENSION);
//            $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + IMG_EXTENSION);
//            // Cuando hay Guerra
//            if(o.contador_guerra) {
//                $("#mano .guerra .contador figcaption").html(o.contador_guerra);
//            }
//            $("#mano").show();
//        });
//        
//        $("#mano .respuesta").on('click', function() {
//            // Deshabilita cartas //
////            $("#mano .jugador1").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador1.carta.img + '_deshabilitado' + IMG_EXTENSION);
////            $("#mano .jugador2").prop("src", IMG_CARPETA + IMG_NOMBRE + o.jugador2.carta.img + '_deshabilitado' + IMG_EXTENSION);
//            // Envia la selección //
//            socket.emit('respuesta', { jugador: "JUGADOR1", respuesta: "ESTASSSS" });
//            $("#mano .respuesta").off('click');
//        });
//
////
////        btn_mano.onclick = function () {
////            console.log('Respondo');
////            var eleccion = document.getElementsByName("opcion");
////            var val = "";
////            for (var j = 0; j < eleccion.length; j++) {
////                if (eleccion[j].checked) {
////                    val = eleccion[j].value;
////                }
////            }
////            socket.emit('respuesta', val);
////            btn_mano.disabled = true;
////        };
//
//    });
//
//}