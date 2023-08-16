module.exports = {
  apps: [{
    name: 'flanets',
    script: 'server.js',
    watch: '.',
    env: {
      NODE_PORT: 9050
    }
  }]
};
