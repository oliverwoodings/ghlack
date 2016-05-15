require('babel-register')
require('babel-polyfill')

var path = require('path')

process.on('unhandledRejection', function (reason) {
  process.emit('SIGTERM')
  throw reason
})

console.log('foooobar')

require('./app')
