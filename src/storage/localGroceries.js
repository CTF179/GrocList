
/*
  * Local non-perisitent grocery item storage
  *
  * @class LocalGrocery
  * @param <{logger:<logger>}>obj 
  *
  *
  * @property <Container> groceries
  * */
function LocalGroceries(config) {
  this.groceries = [];
  this.logger = config.logger;
}

/*
  * Finds a grocery in groceries
  * @param <string> name
  * @returns <Grocery> groceryItem
  * */
LocalGroceries.prototype.get = function(name) {
  return this.groceries.find(element => element.name === name);
};

/*
  * Adds a grocery to the groceries
  * @param <Grocery> grocery 
  * @returns void
  * */
LocalGroceries.prototype.add = function(grocery) {
  this.groceries.push(grocery);
};

/*
  * Deletes the specified grocery from groceries
  * @param <string> name 
  * @returns void
  * */
LocalGroceries.prototype.delete = function(name) {
  this.groceries = this.groceries.filter(element => element.name != name);
};

/*
  * Deletes the specified grocery from groceries
  * @param <string> name 
  * @param <{property:Grocery.property, value:type(property)}> updateObj
  * @returns void
  * */
LocalGroceries.prototype.update = function(name, updateObj) {
  const grocery = this.get(name);
  grocery.set(updateObj.property, updateObj.value);
};

/*
  * Stringifies the current grocery list
  * @param void
  * @returns <string> groceryItem
  * */
LocalGroceries.prototype.toString = function() {
  return JSON.stringify(this.groceries);
};

module.exports = {
  LocalGroceries
}

