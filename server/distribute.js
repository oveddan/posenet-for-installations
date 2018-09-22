const {compile} = require('nexe')

compile({
  input: './dist/socket.js',
  target: 'windows-x64-8.4.0',
  // target: 'macos-8.4.0',
  output: 'posenetSocket'
}).then(() => {console.log('success')})
