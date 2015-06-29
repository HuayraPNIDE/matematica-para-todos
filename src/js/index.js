var amigos = {};

function init_server(server_name) {

    var spawn = require('child_process').spawn;
    spawn = require('child_process').spawn;
    spawn('nodejs', ['../bin/server.js', "--usuario=" + server_name]);
}

function connect_own_server(nro_jugador, nombre_jugador) {

    var local_ip = require('my-local-ip')()
    var socket = io("http://" + local_ip + ":3000/", {query: 'nro_jugador=' + nro_jugador + "&nombre_jugador=" + nombre_jugador});

    return socket;
}

function registrar_espera(socket) {

    socket.on('connect', function () {
        console.log('Me conecte al servidor');

        socket.on('listo', function (o) {
            $("#amigos").hide();
            $("#titulo").html('A jugar');
            $(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
            $(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
            $(".juego").show();
        });

        socket.on('retiro', function (msg) {
            socket.disconnect();
        });

        socket.on('fin', function (resultados) {
            socket.disconnect();
        });

        /*
         var btn_mano = document.getElementById('btn_mano');
         socket.on('mano', function(o) {
         btn_mano.disabled = false;
         });
         
         btn_mano.onclick = function() {
         console.log('Respondo'); 
         var eleccion = document.getElementsByName("opcion");
         var val="";
         for(var j=0; j < eleccion.length; j++) {
         if(eleccion[j].checked) {
         val = eleccion[j].value;
         }
         }
         
         socket.emit('respuesta', val);
         btn_mano.disabled = true;
         };
         */

    });

}

function buscar_amigos() {
    var spawn = require('child_process').spawn;
    var proceso = spawn("avahi-browse", ['-a', '-r', '-p', '--ignore-local']);
    var lineas;
    proceso.stdout.on("data", function (chunk) {
        lineas = ("" + chunk).split("\n");
        for (i = 0; lineas.length > i; i++) {
            if (/huayra_mxt/.test(lineas[i])) {
                campos = lineas[i].split(";");

                // tipo
                if (campos[0] == '=') {
                    ip = campos[3].split('-')[1].replace(/\\/gi, "");
                    nombre = campos[3].split('-')[2];
                    amigos[ip] = nombre;
                }

                if (campos[0] == '-') {
                    ip = campos[3].split('-')[1].replace(/\\/gi, "");
                    delete amigos[ip];
                }
            }
        }
    });
}

function actualizar_amigos() {
    e = $("<div></div>");
    for (var k in amigos) {
        amigo = amigos[k];
        tmp = '<div class="media thumbnail" data-ip="' + k + '" data-nombre="' + amigos[k] + '" > \
              <div class="media-left"><a href="#"><img class="media-object" src="img/avatar-neutro.png" width="81" height="86"></a></div> \
              <div class="media-body"><h4 class="media-heading">' + amigos[k] + '</h4></div> \
            </div>';

        $(e).append($(tmp).on('click', function () {
            elegir_amigo($(this).data('ip'), $(this).data('nombre'));
        }));
    }
    $('#listado').html(e);
    $('#listado').show();
}

function elegir_amigo(amigo_ip, nombre_jugador) {
    var socket = io("http://" + amigo_ip + ":3000/", {query: 'nro_jugador=jugador2&nombre_jugador=' + nombre_jugador});
//    return socket;
    registrar_espera(socket);
}
