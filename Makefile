BIN = ./node_modules/.bin

.PHONY: bootstrap;

bootstrap:
	@npm install

watch:
	@NODE_ENV=development $(BIN)/nodemon .

start:
	@NODE_ENV=production node .
