function init_server(server_name) {

	var spawn = require('child_process').spawn;
	spawn = require('child_process').spawn;
	spawn('nodejs', ['../bin/server.js', "--usuario="+server_name]);
}

function connect_own_server(nro_jugador, nombre_jugador) {

	var local_ip = require('my-local-ip')()
	var socket = io("http://"+local_ip+":3000/", {query: 'nro_jugador=' + nro_jugador + "&nombre_jugador=" + nombre_jugador});


	return socket;
}

function registrar_espera(socket) {

	socket.on('connect', function() {
		console.log('Me conecte al servidor');

		socket.on('listo', function(o) {
			$("#amigos").hide();
			$("#titulo").html('A jugar');
			$(".jugador1 .avatar").html(o.jugador1.nombre + "(" + o.jugador1.ip + ")");
			$(".jugador2 .avatar").html(o.jugador2.nombre + "(" + o.jugador2.ip + ")");
			$(".juego").show();


		});

		socket.on('retiro', function(msg) {
			socket.disconnect();
		});

		socket.on('fin', function(resultados) {
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
