/*
  * Run as a standalone application or with a server wrapper using command
  * line flags. 
  *
*/
(async () => {
  const args = process.argv.slice(2);
  const flags = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const flag = args[i].slice(2);
      let equal = flag.indexOf('=');
      if (equal == -1) {
        flags[flag] = true;
        continue;
      }
      flags[flag.slice(0, equal)] = flag.slice(equal + 1).replace(/'/g, '');
    }
  }

  if (flags.console) {
    // Run as a standalone application 
    const { GroceryApp } = require("./GrocList/main.js")
    const app = new GroceryApp();
    app.start();

  } else {
    // Run as the server
    const { logger } = require("./util/logging.js");
    const { GroceryApp } = require("./GrocList/main.js");
    const { Server } = require("./api/main.js");

    const server = new Server();
    await server.start(new GroceryApp({
      storage: flags['storage'],
      fStorageLocation: "db.json",
      logger: logger
    }));
  }
})()
