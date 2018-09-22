const {compile} = require('nexe')

compile({
  input: './serve.js',
  target: 'windows-x64-8.4.0',
  // target: 'macos-8.4.0',
  resources: ['./build/**/*'],
  output: 'posenet'
}).then(() => {console.log('success')})
