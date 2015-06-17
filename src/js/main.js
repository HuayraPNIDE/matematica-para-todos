var puerto = 3000;

var Servidor = function(nombre) {
    spawn = require('child_process').spawn;
    spawn('nodejs', ['../bin/server.js', "--usuario="+nombre]);
};

var Conexion = function (ip, nroJugador, nombreJugador) {
    this.socket = io("http://" + ip + ":" + puerto + "/", {query: 'nro_jugador=' + nroJugador + "&nombre_jugador=" + nombreJugador});
    this.registrarEspera = function() {
        var self = this;
        self.socket.on('connect', function () {
            console.log('Me conecte al servidor');
            self.socket.on('listo', function (o) {
                $("#amigos").hide();
                $("#titulo").html('TITULO a CAMBIAR!!!');
                $(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
                $(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
                $(".juego").show();
            });

            self.socket.on('retiro', function (msg) {
                $("#titulo").html(msg + ' Se retiro <br> Es el fin del juego');
                $(".juego").hide();
                self.socket.disconnect();
            });

            self.socket.on('fin', function (resultados) {
                $("#titulo").html('Es el fin del juego <br> Estos son los resultados');
                $(".juego").hide();
                self.socket.disconnect();
            });

            self.socket.on('mano', function (o) {
                console.log('Desde el server me llegan cartas:');
                console.log(JSON.stringify(o, null, 2));
//                jugador1: {carta: jugadores.jugador1.mazo[i], contador: 0 }

                
                $("#cont_jugador1").html(o.contador_jugador1);
                $("#cont_jugador2").html(o.contador_jugador2);
                $("#cont_guerra").html(o.contador_guerra);
                $("#mazos, #opciones").show();
                
                
                // Cambia las cartas para la nueva mano
                console.log($("#carta_jugador1").find("img"));
                $("#carta_jugador1").find("img").prop("src", o.carta1.img).on('click', function () {
                    this.socket.emit('respuesta', usuario_info.nombre);
                });
                console.log($("#carta_jugador1").find("img").prop("src"));
                $("#carta_jugador2").find("img").prop("src", o.carta2.img);
                $("#mazos, #opciones, #cartas").show();
                
                
                ///***///
                
                btn_mano.onclick = function () {
                    console.log('Respondo');
                    var eleccion = document.getElementsByName("opcion");
                    var val = "";
                    for (var j = 0; j < eleccion.length; j++) {
                        if (eleccion[j].checked) {
                            val = eleccion[j].value;
                        }
                    }
                    this.socket.emit('respuesta', val);
                    btn_mano.disabled = true;
                };
                
            });
        });
    };
};

var Cliente = function(nombre, avatar) {
    this.nombre = nombre;
    this.avatar = avatar;
    this.localIp = require('my-local-ip')();
    this.init = function() {
        var conexion = new Conexion(this.localIp, 'jugador1', this.nombre);
        $("#avatar").hide();
        $("#actualizar, #amigos").show();
        conexion.registrarEspera();
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
              <div class="media-left"><a href="#"><img class="media-object" src="res/gui/avatar-neutro.png"></a></div> \
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
        var conexion = new Conexion(ip, 'jugador2', nombreJugador);
        conexion.registrarEspera();
    }
};
