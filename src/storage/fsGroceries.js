const fs = require("fs")
const { Grocery } = require("./grocery.js")

/*
  * Local persistent grocery item storage
  *
  * @class FsGrocery
  * @param <{logger: <logger>}> config
  *
  * @property <Container> groceries
  * */
function FsGroceries(config) {
  this.config = config
  this.logger = this.config.logger;
  try {
    if (!fs.existsSync(this.config.fStorageLocation)) {
      fs.writeFileSync(this.config.fStorageLocation, JSON.stringify({ groceries: [] }), 'utf8', (err) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Data updated");
      })
    }
    this.data = JSON.parse(fs.readFileSync(this.config.fStorageLocation, 'utf8'));
    this.groceries = this.data.groceries.map(obj => new Grocery(obj));
  } catch (err) {
    this.logger.error(err);
    process.exit(1);
  }
}

function prefix(obj) {
  return { groceries: obj };
}

/*
  * Finds a grocery in groceries
  * @param <string> name
  * @returns <Grocery> groceryItem
  * */
FsGroceries.prototype.get = function(name) {
  // logger.info(JSON.stringify(this.groceries));
  return this.groceries.find((curr, _, __) => curr.name === name);
};

/*
  * Adds a grocery to the groceries
  * @param <Grocery> grocery 
  * @returns void
  * */
FsGroceries.prototype.add = function(grocery) {
  this.groceries.push(grocery);
  fs.writeFileSync(this.config.fStorageLocation, JSON.stringify(prefix(this.groceries)), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    this.logger.info("Data added");
  })
};

/*
  * Deletes the specified grocery from groceries
  * @param <strin> name
  * @returns void
  * */
FsGroceries.prototype.delete = function(name) {
  this.groceries = this.groceries.filter(element => element.name != name);
  fs.writeFileSync(this.config.fStorageLocation, JSON.stringify(prefix(this.groceries)), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    this.logger.info("Data Deleted");
  })
};

/*
  * Deletes the specified grocery from groceries
  * @param <string> name 
  * @param <{property:Grocery.property, value:type(property)}> updateObj
  * @returns void
  * */
FsGroceries.prototype.update = function(name, updateObj) {
  let grocery = this.get(name);
  this.logger.info(`grocery: ${JSON.stringify(grocery, null, 2)}`);
  grocery.set(updateObj.property, updateObj.value)
  fs.writeFileSync(this.config.fStorageLocation, JSON.stringify(prefix(this.groceries)), 'utf8', (err) => {
    if (err) {
      console.error(err);
      return;
    }
    this.logger.info("Data Updated");
  })
};

/*
  * Stringifies the current grocery list
  * @param void
  * @returns <string> groceryItem
  * */
FsGroceries.prototype.toString = function() {
  return JSON.stringify(this.groceries);
};

module.exports = {
  FsGroceries
}

