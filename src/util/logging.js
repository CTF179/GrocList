const { createLogger, transports, format } = require('winston')

/*
  * Utility logger via Winston
  * */
const logger = createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })),
  transports: [
    new transports.Console(),
    new transports.File({ filename: "app.log" })
  ]
})

if (process.env.NODE_ENV === 'test') {
  logger.transports.forEach((t) => logger.remove(t));
}

module.exports = {
  logger
}
