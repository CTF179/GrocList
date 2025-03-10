
const { Grocery, GroceryProps } = require("../storage/grocery.js")
const { Storage } = require("../storage/main.js")

/*
  * GroceryApp Instance
  *
  * @class GroceryApp
  * @param <[AppParam]any> configuration 
  *
  * @property <string> host 
  * @property <integer> port
  * @property <[string]function()> routes
  * @property <ServerApp> application
  * */
function GroceryApp(configuration = null) {
  if (configuration == null) {
    const { defaultConfiguration } = require("./defaults.js");
    configuration = defaultConfiguration;
  }
  Object.entries(configuration).forEach(([key, value]) => {
    this[key] = value;
  })

  this.groceryList = Storage(configuration);

  if (configuration.initData != null) {
    for (const el of configuration.initData) {
      this.groceryList.add(new Grocery(el));
    }
  }
}

/**
  * Lists the grocery list items in the object
  * @param void 
  * @returns void
  *
*/
GroceryApp.prototype.list = function() {
  if (this == null) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  return this.groceryList.toString();
}

/**
  * Creates a new item and appends it to grocery list
  * @param <GroceryItem> obj
  * @returns void
*/
GroceryApp.prototype.create = async function(obj) {
  // TODO: Clean this
  if (this == null) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  const keys = Object.keys(obj);
  if (keys.length < 3 || keys.length > 4) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (!keys.every(key => GroceryProps.includes(key))) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (obj.purchased !== undefined && typeof obj.purchased !== "boolean") {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (!obj.name || !obj.quantity || !obj.price) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (this.groceryList.get(obj.name) != null) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (!/^[A-Za-z]+$/.test(obj.name) || typeof obj.name !== 'string') {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (typeof obj.quantity !== 'number' || !Number.isInteger(obj.quantity) || obj.quantity < 0) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  if (typeof obj.price !== 'number' || obj.price < 0) {
    const message = `Invalid Object`;
    throw new Error(message);
  }

  const grocery = new Grocery({
    name: String(obj.name),
    quantity: parseInt(obj.quantity),
    price: parseFloat(obj.price),
    purchased: obj.purchased ?? false
  });
  this.groceryList.add(grocery);
  this.logger.info(`\nAdded ${obj.name}\n`);
}

/**
  * Updates a prexisting grocery item's value
  * @param <string> name
  * @param <{property:grocery.property, value: grocery.property}> updateObj
  * @returns void
  *
*/
GroceryApp.prototype.update = async function(name, updateObj) {
  // TODO: Clean this
  if (this.groceryList.get(name) == null) {
    const message = `Invalid Object`;
    throw new Error(message);
  }

  if (Object.keys(updateObj).length != 2) {
    const message = `Invalid Update Object`;
    throw new Error(message);
  }
  if (!updateObj.property || !updateObj.value) {
    const message = `Invalid Update Object`;
    throw new Error(message);
  }
  if (!GroceryProps.includes(updateObj.property)) {
    const message = `Invalid Update Object`;
    throw new Error(message);
  }
  switch (updateObj.property) {
    case "name":
      if (this.groceryList.get(updateObj.value) != null) {
        const message = `Invalid Update Object`;
        throw new Error(message);
      }
      if (!/^[A-Za-z]+$/.test(updateObj.value) || typeof updateObj.value !== 'string') {
        const message = `Invalid Update Object`;
        throw new Error(message);
      }
      break;
    case "quantity":
      if (typeof updateObj.value !== 'number' || !Number.isInteger(updateObj.value) || updateObj.value < 0) {
        const message = `Invalid Update Object`;
        throw new Error(message);
      }
      break;
    case "price":
      if (typeof updateObj.value !== 'number' || updateObj.value < 0) {
        const message = `Invalid Update Object`;
        throw new Error(message);
      }
      break;
    case "purchased":
      if (updateObj.value !== undefined && typeof updateObj.value !== "boolean") {
        const message = `Invalid Update Object`;
        throw new Error(message);
      }
      break;
    default:
      const message = `Invalid Update Object`;
      throw new Error(message);
  }

  this.groceryList.update(name, updateObj)
  this.logger.info(`Updated ${name}: '${updateObj.property}' to '${updateObj.value}'`);
}

/**
  * Deletes a grocery item
  * @param <GroceryItem> groceryItem 
  * @returns void
*/
GroceryApp.prototype.del = async function(name) {
  if (this.groceryList.get(name) == null) {
    const message = `Invalid Object`;
    throw new Error(message);
  }
  this.groceryList.delete(name)
  this.logger.info(`Deleted ${name} `);
}

/**
  * Checks off an item from the list
  * @param <GroceryItem> groceryItem 
  * @returns void
*/
GroceryApp.prototype.checkOff = async function(name) {
  if (this.groceryList.get(name) == null) {
    const message = `Invalid Object: No Object with ${name} `;
    throw new Error(message);
  }
  this.groceryList.update(name,
    {
      property: "purchased",
      value: !this.groceryList.get(name).purchased
    }
  )
  this.logger.info(`Checked Off ${name} `);
}

/* Blocks io until user input passes callback 
  * @param <string> prompt
  * @returns void
*/
GroceryApp.prototype.input = function(prompt, isValid = (input) => true) {
  return new Promise((callback, errorFn) => {
    const askQuestion = () => {
      this.rl.question(prompt, (input) => {
        this.logger.info(input);
        if (isValid(input)) {
          callback(input);
        } else {
          this.logger.info("Invalid Input");
          askQuestion();
        }
      });
    };
    askQuestion();
  });
}

/*
  * Runs standalone version of application 
  *
  * Uses the Readline Package to output a text ui off the application.
  *
  * @param void
  * @returns void
  * */
GroceryApp.prototype.start = async function() {
  const mOptions = `\
| ------------------------------------|
| (R)ead |
| (A)dd |
| (U)pdate an item |
| (D)elete an item |
| (C)heck off an item |
| (q)uit |
| ------------------------------------|
    \n > `;
  const readline = require('readline');
  this.rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: mOptions,
  })
  this.rl.prompt();
  this.rl.on('line', async (answer) => {
    let out;
    let name, quantity, price;
    let groceries;

    switch (answer.trim()) {
      /* ------------ READ ----------------*/
      case answer.match(/^R/i)?.input:
        groceries = JSON.parse(this.list());
        let index = 1;
        out = "\n"
        out = `| ------------------------------------\n`;
        for (const grocery of groceries) {
          if (grocery.purchased == true) {
            out = out + `| \x1b[9m item ${index}: ${grocery.name} - $${grocery.price} [qty: ${grocery.quantity}] \x1b[0m\n`
          } else {
            out = out + `| item ${index}: ${grocery.name} - $${grocery.price} [qty: ${grocery.quantity}] \n`
          }
          index += 1;
        }
        out = out + `| ------------------------------------\n`;
        this.logger.info(out);
        break;

      /* ------------ CREATE ----------------*/
      case answer.match(/^A/i)?.input:
        name = await this.input("Name: ", (input) => {
          // TODO: Further validate
          return input.trim().length > 0;
        });

        quantity = await this.input("Quantity: ", (input) => {
          // TODO: Further validate
          const num = parseInt(input);
          return !isNaN(num) && num > 0;
        });

        price = await this.input("price: ", (input) => {
          // TODO: Further validate
          const num = parseFloat(input);
          return !isNaN(num) && num > 0;
        })

        try {
          this.create({ name: name, quantity: quantity, price: price });
        } catch (err) {
          this.logger.error(err);
        }
        break;

      /* ------------ UPDATE ----------------*/
      case answer.match(/^U/i)?.input: // Update
        name = await this.input("Name: ", (input) => {
          // TODO: Further validate
          return input.trim().length > 0;
        });

        out = ""
        out += '|------------------------------------\n';
        out += '| name, quantity, price, purchased\n'
        out += '| ------------------------------------\n'
        this.logger.info(out)

        const property = await this.input("What would you like to update? ", (input) => {
          return GroceryProps.includes(input.trim());
        })

        const value = await this.input("What is the new value? ", (input) => {
          // TODO: Further validate
          switch (property) {
            case "name":
              return input_trim.length > 0;
            case "quantity":
              num = parseInt(input);
              return !isNaN(num) && num > 0;
            case "price":
              num = parseFloat(input);
              return !isNaN(num) && num > 0;
            case "purchased":
              return (input_trim == 'true' || input_trim == 'false');
            default:
              break;
          }
          return false;
        });

        try {
          this.update(name, { property: property, value: value });
        } catch (err) {
          this.logger.error(err);
        }
        break;

      /* ------------ DELETE ----------------*/
      case answer.match(/^D/i)?.input:
        name = await this.input("Name: ", (input) => {
          // TODO: Further validate
          return input.trim().length > 0;
        });
        try {
          this.del(name);
        } catch (err) {
          this.logger.error(err);
        }
        break;

      /* ------------ CHECKOFF ----------------*/
      case answer.match(/^C/i)?.input:
        name = await this.input("Name: ", (input) => {
          // TODO: Further validate
          return input.trim().length > 0;
        });

        try {
          this.checkOff(name);
        } catch (err) {
          this.logger.error(err);
        }
        break;

      /* ------------ QUIT ----------------*/
      case answer.match(/^Q/i)?.input:
        this.rl.close()
        break;

      default:
        this.rl.close()
        break;
    }
    this.rl.prompt();
  }).on('close', (_) => {
    this.logger.info("Closing application");
    process.exit(0);
  });
}

module.exports = {
  GroceryApp
}
