module.exports = [{
  script: 'dist/server.js',
  name: 'izing-backend',
  exec_mode: 'cluster',
  cron_restart: '00 00 * * *',
  max_memory_restart: '450M',
  instances: 1,
  watch: false
}]
