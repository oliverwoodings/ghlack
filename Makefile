BIN = ./node_modules/.bin

.PHONY: bootstrap lint test watch start deploy;

bootstrap:
	@npm install

watch:
	@NODE_ENV=development $(BIN)/nodemon .

lint:
	@$(BIN)/standard

test: lint

start:
	@NODE_ENV=production node .

deploy:
	@pm2 deploy production
