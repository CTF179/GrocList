/*
  * Grocery Item instance
  *
  * @class Grocery
  * @param <{ 
    * name: string 
    * quantity: integer 
    * price: float 
    * purchased: boolean 
  * }> obj 
  *
  * @property <string> name 
  * @property <integer> quantity
  * @property <float> price
  * @property <boolean> purchased
  * */
const GroceryProps = ["name", "quantity", "price", "purchased"];
function Grocery(obj) {
  this.name = obj.name;
  this.quantity = obj.quantity;
  this.price = obj.price;
  this.purchased = obj.purchased;
}


/*
  * Updates property of a grocery item 
  * @param <Grocery.property> property 
  * @param <type(property)> newValue
  * @returns void
  * */
Grocery.prototype.set = function(property, newValue) {
  if (this.hasOwnProperty(property)) {
    this[property] = newValue;
  }
};


/*
  * Stringifies the current grocery item
  * @param void
  * @returns <string> groceryItem
  * */
Grocery.prototype.toString = function() {
  return JSON.stringify({ grocery: this });
};


module.exports = {
  Grocery, GroceryProps
}
