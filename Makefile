IS_NODEJS:=$(shell which nodejs)

NODE_BINARY_NAME=node


all:
	./matematica-para-todos

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

