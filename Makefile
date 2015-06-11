all:
	@echo ""
	@echo "Ayuda"
	@echo ""

server:
	-killall node
	-killall avahi-publish-service
	node bin/server.js --usuario=$(USUARIO)

cliente:
	nw src/
