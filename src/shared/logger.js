const pino = require('pino');

const logger = pino({
  level: 'info', 
  transport: {
    targets: [
      {
        target: 'pino-pretty', 
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        },
        level: 'info'
      },
      {
        target: 'pino/file',
        options: { destination: './logs/app.log' },
        level: 'info'
      }
    ]
  }
});

module.exports = logger;
