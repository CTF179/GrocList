
function Grocery(name = "", quantity = 0, price = 0.0, purchased = false) {
  this.name = name;
  this.quantity = quantity;
  this.price = price;
  this.purchased = purchased;
}

Grocery.prototype.inStock = function() {
  return quantity == 0;
};

Grocery.prototype.set = function(property, newValue) {
  if (this.hasOwnProperty(property)) {
    this[property] = newValue;
  }
};

Grocery.prototype.toString = function() {
  return `\
|------------------------------------
| name: ${this.name}
| quantity: ${this.quantity}
| price: ${this.price}
| purchased: ${this.purchased}
|------------------------------------

`;
};



function Groceries() {
  this.groceries = []
}

Groceries.prototype.toString = function() {
  if (this.groceries.length == 0) return "Empty list\n"

  let output = `|------------------------------------\n`;
  for (const [index, item] of this.groceries.entries()) {
    if (item.purchased == true) {
      output = output + `| \x1b[9m item ${index + 1}: ${item.name} - $${item.price} [qty:${item.quantity}] \x1b[0m\n`
    } else {
      output = output + `| item ${index + 1}: ${item.name} - $${item.price} [qty:${item.quantity}] \n`
    }
  }
  output = output + `|------------------------------------\n`;
  return output;
};

Groceries.prototype.get = function(name) {
  return this.groceries.find(element => element.name === name);
};

Groceries.prototype.add = function(grocery) {
  this.groceries.push(grocery);
};

Groceries.prototype.delete = function(name) {
  this.groceries = this.groceries.filter(element => element.name != name);
};

module.exports = {
  Grocery,
  Groceries
}
