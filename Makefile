IS_NODEJS:=$(shell which nodejs)

NODE_BINARY_NAME=nodejs


all:
	./matematica-para-todos

test:
	clear
	-killall nodejs
	-killall avahi-publish-service
	-killall avahi-browse
	$(NODE_BINARY_NAME) bin/server.js --usuario=USUARIO_TEMPORAL

check_node_binary:
ifdef IS_NODEJS
	$(eval NODE_BINARY_NAME = nodejs)
endif

server: check_node_binary
	-killall node
	-killall avahi-publish-service
	$(NODE_BINARY_NAME) bin/server.js --usuario=$(USUARIO)

cliente:
	nw src/

