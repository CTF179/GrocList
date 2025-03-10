const { logger } = require('../util/logging.js')
const { list, add, edit, remove, toggle } = require('./handlers.js')
const http = require('http')

const PORT = 8080;
const HOSTNAME = "localhost"
const ROUTES = {
  "/list": list,
  "/add": add,
  "/edit": edit,
  "/remove": remove,
  "/toggle": toggle
}

/*
  * @class Server
  *
  * Server Instance 
  *
  * @property <string> host 
  * @property <integer> port
  * @property <{}> options
  * @property <[string]function()> routes
  * @property <ServerApp> application
  * */
function Server(host = HOSTNAME, port = PORT, options = { logger: logger }) {
  this.host = host;
  this.port = port;
  this.logger = options.logger;

  this.routes = ROUTES;
  this.application = null;
}

/*
  * Gets the server connection string
  * @param void
  * @returns <string> listening_address
  * */
Server.prototype.Connection = function() {
  return `${this.host}:${this.port}`;
}

/*
  * Starts server instance with application
  * @param <ServerApp> application
  * @returns <Promise> isReady
  * */
Server.prototype.start = function(application = null) {
  return new Promise((resolve, reject) => {
    if (application == null) {
      const message = 'No server application';
      reject(new Error(message))
      return;
    }
    this.application = application;

    this.server = http.createServer((req, res) => {
      if (this.routes[req.url]) {
        this.routes[req.url](this.application, req, res);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Not Found" }));
      }
    });

    this.server.listen(this.port, () => {
      this.logger.info(`Starting server on ${this.Connection()}`)
      resolve();
    });

    this.server.on("error", reject);
  });
};

/*
  * Terminates the server instance 
  * @param void
  * @returns <Promise> isClosed
  * */
Server.prototype.end = function() {
  return new Promise((resolve, reject) => {
    if (this.server) {
      this.server.close((err) => {
        if (err) return reject(err);
        resolve();
      })
    } else {
      resolve();
    }
  })
}

module.exports = {
  Server
}
