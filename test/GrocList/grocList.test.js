const { GroceryApp } = require('../../src/GrocList/main.js')

// TODO: 
// - Grocery App startup 
// - Logging output should be correct for each action

describe('Grocery App', () => {
  /*
    - Grocery App 
      - Passing no configuration resorts to default
      - Passing invalid configuration throws error
  */
  /*
  describe('Grocery App Startup', () => {
    test("Passing no configuration application", () => {
      expect(true).toBe(true) // TODO
    })

    test("Passing invalid configuration", () => {
      expect(true).toBe(true) // TODO
    })
  })
  */

  /*
    - list
      - Can view list.
      - Can view empty list.
      - Can accept trash value.
        - Empty obj
  */
  describe('Grocery App List', () => {
    let app;

    beforeEach(() => {
      app = new GroceryApp(
        {
          logger: { info: jest.fn(), error: jest.fn() },
          storage: 'local',
        }
      );
    })

    test("List empty container", () => {
      expect(app.list()).toBe("[]")
    })

    test("List all items", () => {
      const data = [
        { name: "apple", quantity: 2, price: 1.88 },
        { name: "mango", quantity: 5, price: 4.20 },
        { name: "orange", quantity: 1, price: 0.69 },
      ];

      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: data
      })

      const exp = JSON.stringify(data);
      const act = app.list();

      expect(act).toBe(exp);
    })

    test("List with invalid 'this' object", () => {
      app = null;
      expect(() => app.list()).toThrow(TypeError);
    })

    // test("List item logs correctly", async () => {
    //   expect(app.logger.info).toHaveBeenCalledWith("ADD MY STRING");
    // })

  })

  /*
  - Create
    - Create item with invalid obj
    - Create item with inaccurate values in obj
    - Create item with inaccurate type for values in obj
    - Create item with missing values in obj
    - Create item that exists
    - Create item logs correctly
    - Create item

  */
  describe('GroceryApp Create', () => {
    let app;
    let obj, objs;
    beforeEach(() => {
      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local'
      });
    })

    test("Create item", async () => {
      obj = { name: "apple", quantity: 2, price: 1.88 };

      await app.create(obj);

      const addedItem = app.groceryList.get("apple");

      expect(addedItem).not.toBeUndefined();
      expect(addedItem).not.toBeNull();

      expect(addedItem.name).toBe(obj.name);
      expect(addedItem.price).toBe(obj.price);
      expect(addedItem.quantity).toBe(obj.quantity);
      expect(addedItem.purchased).toBe(false);
    })

    test("Create item logs correctly", async () => {
      obj = { name: "apple", quantity: 2, price: 1.88 };

      await app.create(obj);

      expect(app.logger.info).toHaveBeenCalledWith("\nAdded apple\n");
    })

    test("Create item that exists", async () => {
      obj = { name: "apple", quantity: 2, price: 1.88 };
      await app.create(obj);
      await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
    })

    test("Create item with missing values in obj", async () => {
      objs = [
        { name: "apple", quantity: 2, price: 1.88 },
      ];
      obj = { name: "apple", dummy1: true, dummy2: true };
      await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");

      obj = { price: 2.99, dummy1: true, dummy2: true };
      await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");

      obj = { quantity: 23, dummy1: true, dummy2: true };
      await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
    })

    test("Create item with inaccurate type for values in obj", async () => {
      objs = [
        { name: 2, quantity: 2, price: 1.88 },
        { name: "2apple", quantity: 2, price: 1.88 },
        { name: "app-le", quantity: 2, price: 1.88 },
      ];
      for (obj of objs) {
        await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
      }

      objs = [
        { quantity: "two", name: "apple", price: 1.88 },
        { quantity: "1-", name: "apple", price: 1.88 },
        { quantity: "#", name: "apple", price: 1.88 },
        { quantity: -1, name: "apple", price: 1.88 },
      ];
      for (obj of objs) {
        await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
      }

      objs = [
        { price: "one", name: "apple", quantity: 1 },
        { price: "$1", name: "apple", quantity: 1 },
        { price: -1, name: "apple", quantity: 1 },
      ];
      for (obj of objs) {
        await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
      }
    })

    test("Create item with extra values in obj", async () => {
      // e.g. obj.doesNotExist
      objs = [
        { name: "apple", quantity: 2, price: 1.88, purchased: false, doesNotExist: true },
        { name: "apple", quantity: 2, price: 1.88, purchased: "yes" },
        { name: "apple", quantity: 2, price: 1.88, doesNotExist: true },
      ];
      for (obj of objs) {
        await expect(() => app.create(obj)).rejects.toThrow("Invalid Object");
      }

      objs = [
        { name: "apple", quantity: 2, price: 1.88, purchased: true },
      ];
      for (obj of objs) {
        await expect(app.create(obj)).resolves.not.toThrow();
      }
    })

    test("Create item with invalid obj", async () => {
      // e.g. obj == null
      obj = null
      await expect(() => app.create(obj)).rejects.toThrow("Cannot convert undefined or null to object");
    })
  })

  /*
  - update
    - "Update item"
    - "Update item that doesn't exist"
    - "Update item with invalid update object"
  */
  describe("GroceryApp Update", () => {
    let app;
    beforeEach(() => {
      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local'
      });
    })

    test("Update item", async () => {

      updateObjs = [
        { property: "name", value: "orange" },
        { property: "quantity", value: 100 },
        { property: "price", value: 100.00 },
      ];

      for (const el of updateObjs) {
        app = new GroceryApp({
          logger: { info: jest.fn(), error: jest.fn() },
          storage: 'local',
          initData: [{ name: "apple", quantity: 2, price: 1.88 }],
        })
        await expect(app.update("apple", el)).resolves.not.toThrow();
      }
    })

    test("Update item no side-effects", async () => {

      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: [{ name: "apple", quantity: 2, price: 1.88 }],
      })
      await app.update("apple", { "property": "name", "value": "orange" })
      await expect(app.groceryList.get("orange").name).toBe("orange");
      await expect(app.groceryList.get("orange").quantity).toBe(2);
      await expect(app.groceryList.get("orange").price).toBe(1.88);


      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: [{ name: "apple", quantity: 2, price: 1.88 }],
      })
      await app.update("apple", { "property": "quantity", "value": 100 })
      await expect(app.groceryList.get("apple").name).toBe("apple");
      await expect(app.groceryList.get("apple").quantity).toBe(100);
      await expect(app.groceryList.get("apple").price).toBe(1.88);


      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: [{ name: "apple", quantity: 2, price: 1.88 }],
      })
      await app.update("apple", { "property": "price", "value": 100.00 })
      await expect(app.groceryList.get("apple").name).toBe("apple");
      await expect(app.groceryList.get("apple").quantity).toBe(2);
      await expect(app.groceryList.get("apple").price).toBe(100.00);
    })

    test("Update item that doesn't exist", async () => {
      await expect(() => app.update("apple", { "name": "orange" })).rejects.toThrow("Invalid Object");
    })

    test("Update item with invalid update object", async () => {
      const updateObjs = [
        { property: "name", value: "steeeeeeve", invalidParameter: true },
        { invalidEntry: "42069God", value: 42 },
        { property: "price", invalidEntry: "black" },
        { property: "42069God", value: "black" },
        { property: "name", value: 2 },
        { property: "quantity", value: "steve" },
        { property: "price", value: "steve" },
      ]

      for (const updateObj of updateObjs) {
        app = new GroceryApp({
          logger: { info: jest.fn(), error: jest.fn() },
          storage: 'local',
          initData: [{ name: "apple", quantity: 2, price: 1.88 }],
        })
        await expect(() => app.update("apple", updateObj)).rejects.toThrow("Invalid Update Object");
      }
    })

    // test("Update item logs correctly", async () => {
    //   expect(app.logger.info).toHaveBeenCalledWith("ADD MY STRING");
    // })
  })


  /*
  - Remove
    - Can remove from list.
    - Can remove from empty list.
  */
  describe("GroceryApp Remove", () => {
    let app;
    beforeEach(() => {
      app = new GroceryApp({ logger: { info: jest.fn(), error: jest.fn() }, storage: 'local' });
    })

    test("Remove from list", async () => {
      app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: [{ name: "apple", quantity: 2, price: 1.88 }],
      })
      expect(app.groceryList.get("apple")).not.toBe(undefined);
      expect(app.del("apple")).resolves.not.toThrow();
      expect(app.groceryList.get("apple")).toBe(undefined);
    })

    test("Remove from empty list", async () => {
      await expect(app.del("apple")).rejects.toThrow("Invalid Object")
    })

    // test("Remove item logs correctly", async () => {
    //   expect(app.logger.info).toHaveBeenCalledWith("ADD MY STRING");
    // })
  });

  /*
  - Check Off
    - Can toggle status of item.
  */
  describe("GroceryApp Check Off", () => {

    test("Check Off: toggle status of item", async () => {
      let app = new GroceryApp({
        logger: { info: jest.fn(), error: jest.fn() },
        storage: 'local',
        initData: [{ name: "apple", quantity: 2, price: 1.88, purchased: false }],
      });
      await expect(app.checkOff("apple")).resolves.not.toThrow();
      await expect(app.groceryList.get("apple").purchased).toBe(true);
    })

    // test("Check Off item logs correctly", async () => {
    //   expect(app.logger.info).toHaveBeenCalledWith("ADD MY STRING");
    // })
  });
})
