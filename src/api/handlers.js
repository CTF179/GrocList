const { logger } = require('../util/logging.js')

/*
  * Endpoint handler for listing resources 
  * @param <ServerApp> app
  * @param <http.IncomingMessage> req 
  * @param <http.ServerResponse> res 
  * @returns void
  * */
function list(app, req, res) {
  logger.info("/list endpoint")
  switch (req.method) {
    case 'GET':
      let body = [];
      req
        .on('error', err => {
          logger.error(err);
        })
        .on('data', chunk => {
          body.push(chunk);
        })
        .on('end', async () => {
          try {
            const items = await app.list();
            logger.info(`Getting Items: ${items}`);

            res.on('error', err => {
              logger.error(err);
            });

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(items);
          } catch (err) {
            const message = "Internal Server Error";
            logger.error(message);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: message
              })
            );
          }
        });

      break;
    default:
      const message = "Invalid Method type";
      logger.error(message);

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: message
        })
      );
      break;
  }
}
/*
  * Endpoint handler for adding resources
  * @param <ServerApp> app
  * @param <http.IncomingMessage> req 
  * @param <http.ServerResponse> res 
  * @returns void
  * */
function add(app, req, res) {
  logger.info("/add endpoint")
  switch (req.method) {
    case "POST":
      let body = [];
      req
        .on('error', err => {
          logger.error(err)
        })
        .on('data', (chunk) => {
          body.push(chunk)
        })
        .on('end', async () => {
          try {
            body = Buffer.concat(body).toString();
            res.on('error', err => {
              logger.error(err)
            })
            logger.info(`received obj: ${body.replace(/(\r?\n|\s)/g, "")}`)
            const obj = JSON.parse(body);
            await app.create(obj);

            res.writeHead(201, { 'Content-Type': 'application/json' });

            res.end();
          } catch (err) {
            const message = "Internal Server Error";
            logger.error(message);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: message
              })
            );
          }
        })
      break;

    default:
      const message = "Invalid Method type";
      logger.error(message);

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: message
        })
      );
      break;
  }
}

/*
  * Endpoint handler for modifying resources
  * @param <ServerApp> app
  * @param <http.IncomingMessage> req 
  * @param <http.ServerResponse> res 
  * @returns void
  * */
function edit(app, req, res) {
  logger.info("/edit endpoint")
  switch (req.method) {
    case 'PUT':
      let body = [];
      req
        .on('error', err => {
          logger.error(err)
        })
        .on('data', (chunk) => {
          body.push(chunk)
        })
        .on('end', async () => {
          try {
            body = Buffer.concat(body).toString();
            res.on('error', err => {
              logger.error(err)
            })
            logger.info(`received obj: ${body.replace(/(\r?\n|\s)/g, "")}`)
            const obj = JSON.parse(body);
            await app.update(obj.name, obj.update);

            res.writeHead(204, { 'Content-Type': 'application/json' });

            res.end();
          } catch (err) {
            const message = "Internal Server Error";
            logger.error(message);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: message
              })
            );
          }
        })
      break;
    case 'PATCH':
      // TODO
      break;
    default:
      const message = "Invalid Method type";
      logger.error(message);

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: message
        })
      );
      break;
  }
}

/*
  * Endpoint handler for deleting resources
  * @param <ServerApp> app
  * @param <http.IncomingMessage> req 
  * @param <http.ServerResponse> res 
  * @returns void
  * */
function remove(app, req, res) {
  logger.info("/remove endpoint")
  switch (req.method) {
    case 'DELETE':
      let body = [];
      req
        .on('error', err => {
          logger.error(err)
        })
        .on('data', (chunk) => {
          body.push(chunk)
        })
        .on('end', async () => {
          try {
            body = Buffer.concat(body).toString();
            res.on('error', err => {
              logger.error(err)
            })
            logger.info(`received obj: ${body.replace(/(\r?\n|\s)/g, "")}`)

            const obj = JSON.parse(body);
            await app.del(obj.name);

            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();
          } catch (err) {
            const message = "Internal Server Error";
            logger.error(message);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: message
              })
            );
          }
        })
      break;
    default:
      const message = "Invalid Method type";
      logger.error(message);

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: message
        })
      );
      break;
  }
}

/*
  * Endpoint handler for toggling resources
  * @param <ServerApp> app
  * @param <http.IncomingMessage> req 
  * @param <http.ServerResponse> res 
  * @returns void
  * */
function toggle(app, req, res) {
  logger.info("/remove endpoint")
  switch (req.method) {
    case 'PUT':
      let body = [];
      req
        .on('error', err => {
          logger.error(err)
        })
        .on('data', (chunk) => {
          body.push(chunk)
        })
        .on('end', async () => {
          try {
            body = Buffer.concat(body).toString();
            res.on('error', err => {
              logger.error(err)
            })
            logger.info(`received obj: ${body.replace(/(\r?\n|\s)/g, "")}`)

            const obj = JSON.parse(body);
            await app.checkOff(obj.name);

            res.writeHead(204, { 'Content-Type': 'application/json' });
            res.end();

          } catch (err) {
            const message = "Internal Server Error";
            logger.error(message);

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(
              JSON.stringify({
                message: message
              })
            );
          }
        })
      break;
    default:
      const message = "Invalid Method type";
      logger.error(message);

      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(
        JSON.stringify({
          message: message
        })
      );
      break;
  }
}

module.exports = { list, add, edit, remove, toggle };
