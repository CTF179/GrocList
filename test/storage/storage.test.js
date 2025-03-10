const fs = require("fs");
const { Storage } = require("../../src/storage/main.js")

describe('storage testing', () => {

  describe("non-persistent local storage", () => {
    let storage;

    beforeEach(() => {
      storage = new Storage();
    });

    test("Should start with an empty list", () => {
      expect(storage.toString()).toEqual(JSON.stringify([]));
    });

    test("Should add a grocery item", () => {
      storage.add({ name: "apple", quantity: 2, price: 1.99, purchased: false });
      expect(storage.toString()).toEqual(JSON.stringify([{ name: "apple", quantity: 2, price: 1.99, purchased: false }]));
    });

    // TODO: update

    test("Should remove a grocery item", () => {
      storage.add({ name: "apple", quantity: 2, price: 1.99, purchased: false });
      storage.delete("apple");
      expect(storage.toString()).toEqual(JSON.stringify([]));
    });

    test("Should not remove an item that does not exist", () => {
      storage.add({ name: "apple", quantity: 2, price: 1.99, purchased: false });
      storage.delete("orange");
      expect(storage.toString()).toEqual(JSON.stringify([{ name: "apple", quantity: 2, price: 1.99, purchased: false }]));
    });

  });


  describe("persistent file storage", () => {
    let testDB;
    let config;

    beforeEach(async () => {
      testDB = "test-db.json";
      config = {
        storage: "file",
        fStorageLocation: testDB,
        logger: {
          info: (_) => { },
          error: (_) => { },
        }
      }

      if (fs.existsSync(testDB)) {
        fs.unlinkSync(testDB);
      }
    });

    afterEach(() => {
      if (fs.existsSync(testDB)) {
        fs.unlinkSync(testDB);
      }
    });

    test("Should save grocery list to a file", () => {
      const storage = Storage(config);
      storage.add({ name: "apple", quantity: 2, price: 1.99, purchased: false });

      const savedData = JSON.parse(fs.readFileSync(testDB, "utf8"));
      expect(savedData).toEqual({ groceries: [{ name: "apple", quantity: 2, price: 1.99, purchased: false }] });
    });

    // TODO: update

    test("Should remove an item and persist changes", () => {
      const storage = Storage(config);
      storage.add({ name: "apple", quantity: 2, price: 1.99, purchased: false });
      storage.delete("apple");

      const savedData = JSON.parse(fs.readFileSync(testDB, "utf8"));
      expect(savedData).toEqual({ groceries: [] });
    });
  });

})

