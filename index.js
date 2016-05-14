require('babel-register')
require('babel-polyfill')

var path = require('path')

process.on('unhandledRejection', function (reason) {
  process.emit('SIGTERM')
  throw reason
})

require('./app')