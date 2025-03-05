
const { Grocery, Groceries } = require("./grocery.js")
const groceryList = new Groceries();

const mOptions = `\
|------------------------------------|
| (R)ead                             |
| (A)dd                              |
| (U)pdate an item                   |
| (D)elete an item                   |
| (C)heck off an item                |
| (q)uit                             |
|------------------------------------|
\n> `;

const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: mOptions,
});


/* Blocks io until user input
*/
function input(prompt) {
  return new Promise((callback, errorFn) => {
    rl.question(prompt, (input) => {
      callback(input);
    }, () => {
      errorFn();
    });
  });
}

/**
  * Lists the grocery list items
*/
function list() {
  console.log(groceryList.toString());
}

/**
  * Creates a new item and appends it to grocery list
*/
async function create() {
  const name = await input("Name: ");
  const quantity = await input("Quantity: ");
  const price = await input("price: ")

  const newGrocery = new Grocery(name, quantity, price);
  groceryList.add(newGrocery);
  console.log(`\nAdded ${newGrocery.name}\n`)
}

/**
  * Updates a prexisting grocery item's value
*/
async function update() {
  const name = await input("Item name: ");
  const groceryItem = groceryList.get(name);

  console.log(groceryItem.toString())
  const property = await input("What would you like to update? ")
  const newValue = await input("What would is the new value? ")
  groceryItem.set(property, newValue);

  console.log(`Updated ${name}: '${property}' to '${newValue}'`);
}

/**
  * Deletes a grocery item
*/
async function del() {
  const name = await input("Item name: ");
  groceryList.delete(name)

  console.log(`Deleted ${name}`);
}

/**
  * Checks off an item from the list
*/
async function checkOff() {
  const name = await input("Item name: ");
  const groceryItem = groceryList.get(name);

  groceryItem.set("purchased", !groceryItem.purchased);

  console.log(`Checked Off ${name}`);
}

function init(configuration) {
  return configuration
}

async function start() {
  rl.prompt();
  rl.on('line', async (answer) => {

    switch (answer.trim()) {
      case answer.match(/^R/i)?.input:
        list();
        break;

      case answer.match(/^A/i)?.input:
        await create();
        break;

      case answer.match(/^U/i)?.input:
        await update();
        break;

      case answer.match(/^D/i)?.input:
        await del();
        break;

      case answer.match(/^C/i)?.input:
        await checkOff();
        break;

      case answer.match(/^Q/i)?.input:
        rl.close()
        break;

      default:
        rl.close()
        break;
    }
    rl.prompt();
  }).on('close', (_) => {
    console.log("");
    process.exit(0);
  });
}

module.exports = {
  start,
  init
}
