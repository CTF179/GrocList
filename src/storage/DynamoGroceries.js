const { Grocery } = require("./grocery.js")
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand, PutCommand, DeleteCommand, paginateScan, UpdateCommand } = require("@aws-sdk/lib-dynamodb");

/*
  * Dynamo grocery item storage
  *
  * @class FsGrocery
  * @param <{logger: <logger>}> config
  *
  * @property <Container> groceries
  * */
function DynamoGroceries(config) {
  this.config = config
  this.logger = this.config.logger;
  this.dClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: "us-east-2" }));
}

// function prefix(obj) {
//   return { groceries: obj };
// }

/*
  * Finds a grocery in groceries
  * @param <string> name
  * @returns <Grocery> groceryItem
  * */
DynamoGroceries.prototype.get = async function(name) {
  const command = new GetCommand({
    TableName: "Groceries",
    Key: { name }
  });

  try {
    const data = await this.dClient.send(command);
    return new Grocery(data.Item);
  } catch (err) {
    return null;
  }
};

/*
  * Adds a grocery to the groceries
  * @param <Grocery> grocery 
  * @returns void
  * */
DynamoGroceries.prototype.add = async function(grocery) {
  const command = new PutCommand({
    TableName: 'Groceries',
    Item: grocery
  });

  try {
    await this.dClient.send(command);
  } catch (err) {
    console.error(err);
  }

};

/*
  * Deletes the specified grocery from groceries
  * @param <strin> name
  * @returns void
  * */
DynamoGroceries.prototype.delete = async function(name) {
  const command = new DeleteCommand({
    TableName: "Groceries",
    Key: { name }
  });

  try {
    await this.dClient.send(command);
  } catch (err) {
    console.error(err);
    return null;
  }

};

/*
  * Deletes the specified grocery from groceries
  * @param <string> name 
  * @param <{property:Grocery.property, value:type(property)}> updateObj
  * @returns void
  * */
DynamoGroceries.prototype.update = async function(name, updateObj) {
  const command = new UpdateCommand({
    TableName: "Groceries",
    Key: { name },
    UpdateExpression: `SET #Property = :value`,
    ExpressionAttributeNames: {
      "#Property": updateObj.property
    },
    ExpressionAttributeValues: {
      ":value": updateObj.value
    }
  })
  try {
    await this.dClient.send(command);
  } catch (err) {
    console.error(err);
    return null;
  }
};


/*
  * Stringifies the current grocery list
  * @param void
  * @returns <string> groceryItems
  * */
DynamoGroceries.prototype.toString = async function() {
  this.logger
  let allItems = [];
  try {
    const client = this.dClient;
    const paginator = paginateScan({ client }, {
      TableName: "Groceries",
      Limit: 100,
    });
    for await (const page of paginator) {
      allItems.push(...page.Items);
    }

    return JSON.stringify(allItems);
  } catch (err) {
    this.logger.error(err);
    return null;
  }
};

module.exports = {
  DynamoGroceries
}

