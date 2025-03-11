/*
  * Interface Storage {
  *   func get(name)
  *   func add(groceryItem)
  *   func delete(name)
  *   func update(name, updateObj)
  *   func toString()
  * }
*/

/*
  * Get the type of storage for the application
  *
  * @param <{logger: string, storage: string}> config
  * @returns <Storage> storage
  * */
function Storage(config = {}) {
  const { LocalGroceries } = require('./localGroceries.js');
  switch (config.storage) {
    case "local":
      return new LocalGroceries(config);
    case "database":
      const { DynamoGroceries } = require('./DynamoGroceries.js');
      return new DynamoGroceries(config);
    case "file":
      const { FsGroceries } = require('./fsGroceries.js');
      return new FsGroceries(config);
    default:
      return new LocalGroceries(config);
  }
}

module.exports = {
  Storage
}
