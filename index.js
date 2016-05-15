require('babel-register')
require('babel-polyfill')

process.on('unhandledRejection', function (reason) {
  process.emit('SIGTERM')
  throw reason
})

require('./app')
