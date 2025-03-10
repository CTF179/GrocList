const { Server } = require("../../src/api/main.js")
const http = require("http")

describe('Api testing', () => {

  /*
  - The Server
    - Passing nothing to server should still start on the localhost, and port 8080
    - passing null application on start should throw an error
  */
  describe('Server tests', () => {
    let ServerAppMock;
    let TestServer;

    beforeEach(() => {
      ServerAppMock = jest.fn();
      TestServer = new Server();
    });

    afterEach(async () => {
      await TestServer.end();
    })

    test("Passing nothing to server should start on localhost 8080", async () => {
      await TestServer.start(ServerAppMock);
      expect(TestServer.Connection()).toBe('localhost:8080');
    });

    test("Passing no application should throw error", () => {
      expect(async () => await TestServer.start()).rejects.toThrow("No server application");
    });
  })

  /*
  - Non-existent URL
    - GET
      - 400 No resource
    - POST
      - 400 No resource
    - PUT
      - 400 No resource
    - DELETE
      - 400 No resource
  */
  describe('Non-existent url', () => {
    let ServerAppMock;
    let TestServer;

    beforeEach(async () => {
      ServerAppMock = {};
      TestServer = new Server({ logger: jest.fn });
      await TestServer.start(ServerAppMock);
    })

    afterEach(async () => {
      await TestServer.end();
    })

    test("Passing all Methods to incorrect endpoints", async () => {
      const REQUEST_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
      const URLS = [
        "/doesNotExist",
        "/List",
        "/Add",
        "/Remove",
        "/Toggle"
      ]

      let SendRequest = (method, url) => {
        return new Promise((resolve, reject) => {
          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json",
            }
          }
          const req = http.request(options, (res) => {
            let data = '';
            res
              .on('data', (chunk) => {
                data += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
              })
          });
          req.on("error", reject);
          req.end();
        })
      }

      const promises = [];
      for (const method of REQUEST_METHODS) {
        for (const url of URLS) {
          promises.push(SendRequest(method, url));
        }
      }

      const responses = await Promise.all(promises);
      for (const response of responses) {
        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body)).toEqual({ error: "Not Found" })
      }

    })
  })

  /*
  - list
    - GET
      - 200 valid list returned
        - sends a valid json object of empty list items
        - sends a valid json object of a single item
        - sends a valid json object of all items
      - 400 something went wrong with the stream
        - Sends 400 error with stream issue
        - Sends a valid json object "Client Side Error"
      - 500 something went wrong internally
        - Sends a valid json object "Internal Server Error"
        - Doesn't crash the server
    - POST
      - 404 not supported
    - PUT 
      - 404 not supported
    - DELETE
      - 404 not supported
  */
  describe('/list endpoint', () => {
    let ServerAppMock;
    let TestServer;
    let SendRequest;

    beforeEach(async () => {
      ServerAppMock = {
        groceries: [],
        list: function () { return JSON.stringify(this.groceries) },
      };
      TestServer = new Server();
      await TestServer.start(ServerAppMock);
      // Race Condition in the test? How would I even go about solving this? 
      await new Promise((resolve) => setTimeout(resolve, 100));

      SendRequest = (method, url) => {
        return new Promise((resolve, reject) => {

          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json"
            }
          }

          const request = http.request(options, (res) => {
            let data = '';
            res
              .on('data', (chunk) => {
                data += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: data });
              })
          });
          request.on("error", reject);
          request.end();
        })
      }
    });

    afterEach(async () => {
      await TestServer.end();
    });

    test("200 GET items list as JSON", async () => {
      let exp = []
      ServerAppMock.groceries = exp;
      let response = await SendRequest('GET', '/list');

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(exp));
    })

    test("200 GET a single item as JSON", async () => {
      const exp = [
        { name: "apple", quantity: 12, price: 12.12, purchased: true }
      ]
      ServerAppMock.groceries = exp;
      response = await SendRequest('GET', '/list');

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(exp));
    })

    test("200 GET a multiple items as JSON", async () => {
      const exp = [
        { name: "apple", quantity: 12, price: 12.12, purchased: true },
        { name: "orange", quantity: 1, price: 1.12, purchased: true },
        { name: "pineapple", quantity: 420, price: 69.69, purchased: false },
      ]
      ServerAppMock.groceries = exp;
      const response = await SendRequest('GET', '/list');

      expect(response.statusCode).toBe(200);
      expect(response.body).toBe(JSON.stringify(exp));
    })

    test("404 REMOVE not allowed", async () => {
      const response = await SendRequest('DELETE', '/list');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("404 POST not allowed", async () => {
      const response = await SendRequest('POST', '/list');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("404 PUT not allowed", async () => {
      const response = await SendRequest('PUT', '/list');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("500 Something went wrong ServerApp", async () => {
      ServerAppMock.list = () => { throw new Error("TEST THROW") };
      const response = await SendRequest('GET', '/list');

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message: "Internal Server Error" }));
      expect(true).toBe(true);
    })

    // test("400 GET with Faulty client with JSON response", async () => {
    //   expect(true).toBe(true);
    // })

  })

  /*
  - add
    - GET 
      - 404 not supported
    - POST
      - Logs created object
      - 201 created valid object
        - Sends nothing
      - 400 something went wrong with the stream
        - Sends 400 error with stream issue
        - Sends a valid json object "Client Side Error"
      - 500 something went wrong internally
        - Sends a valid json object "Internal Server Error"
        - Doesn't crash the server
    - PUT
      - 404 not supported
    - DELETE
      - 404 not supported
  */
  describe('/add endpoint', () => {
    let ServerAppMock;
    let TestServer;
    let SendRequest;

    beforeEach(async () => {
      ServerAppMock = {
        create: jest.fn((_) => { }),
      };
      TestServer = new Server();
      await TestServer.start(ServerAppMock);
      // Race Condition in the test? How would I even go about solving this? 
      await new Promise((resolve) => setTimeout(resolve, 100));

      SendRequest = (method, url, pass_data = null) => {
        pass_data = JSON.stringify(pass_data);
        return new Promise((resolve, reject) => {

          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json",
              'Content-Length': pass_data ? Buffer.byteLength(pass_data) : 0
            }
          }

          const request = http.request(options, (res) => {
            let responseBody = '';
            res
              .on('data', (chunk) => {
                responseBody += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: responseBody });
              })
          });
          request.on("error", reject);

          if (pass_data) {
            request.write(pass_data);
          }

          request.end();
        })
      }
    });

    afterEach(async () => {
      await TestServer.end();
    });


    test("201 POST item as JSON", async () => {
      const obj = { name: "apple", quantity: 12, price: 12.12, purchased: true };
      response = await SendRequest('POST', '/add', obj);
      expect(response.statusCode).toBe(201);
    })

    /* 
    // TODO: I need to implement this behavior
    test("400 POST client bad object", async () => {
      const objs = [
        { name: 12345, quantity: 12, price: 12.12, purchased: true },
        { name: "pineapple", quantity: "NotInteger", price: 12.12, purchased: true },
        { name: "pineapple", quantity: 12, price: "NotFloat", purchased: true },
        { name: "pineapple", quantity: 12, price: 12.12, purchased: "NotBoolean" },

        { doesNotExist: 12345, quantity: 12, price: 12.12, purchased: true },
        { name: "pineapple", doesNotExist: 12, price: 12.12, purchased: true },
        { name: "pineapple", quantity: 12, doesNotExist: 12.12, purchased: true },
        { name: "pineapple", quantity: 12, price: 12.12, doesNotExist: true },
      ];

      const promises = []
      for (const obj of objs) {
        promises.push(SendRequest('POST', '/add', obj));
      }

      const responses = await Promise.all(promises);
      for (const response of responses) {
        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body)).toEqual({ error: "Bad Object" })
      }
    })
    */

    test("405 GET not allowed", async () => {
      const response = await SendRequest('GET', '/add');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 REMOVE not allowed", async () => {
      const response = await SendRequest('DELETE', '/add');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 PUT not allowed", async () => {
      const response = await SendRequest('PUT', '/add');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("500 Something went wrong ServerApp", async () => {
      ServerAppMock.create = () => { throw new Error("TEST THROW") };
      const response = await SendRequest('POST', '/add');

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message: "Internal Server Error" }));
      expect(true).toBe(true);
    })


  })

  /*
  - edit
    - GET 
      - 404 not supported
    - POST
      - 404 not supported
    - PUT
      - Logs updated object
      - 201 valid updated object
        - Sends nothing
      - 400 something went wrong with the stream
        - Sends 400 error with stream issue
        - Sends a valid json object "Client Side Error"
      - 500 something went wrong internally
        - Sends a valid json object "Internal Server Error"
        - Doesn't crash the server
    - DELETE
      - 404 not supported
  */
  describe('/edit endpoint', () => {
    let ServerAppMock;
    let TestServer;
    let SendRequest;

    beforeEach(async () => {
      ServerAppMock = {
        groceries: [],
        update: jest.fn((_, __) => { }),
      };
      TestServer = new Server();
      await TestServer.start(ServerAppMock);
      // Race Condition in the test? How would I even go about solving this? 
      await new Promise((resolve) => setTimeout(resolve, 100));

      SendRequest = (method, url, pass_data = null) => {
        pass_data = JSON.stringify(pass_data);
        return new Promise((resolve, reject) => {

          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json",
              'Content-Length': pass_data ? Buffer.byteLength(pass_data) : 0
            }
          }

          const request = http.request(options, (res) => {
            let responseBody = '';
            res
              .on('data', (chunk) => {
                responseBody += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: responseBody });
              })
          });
          request.on("error", reject);

          if (pass_data) {
            request.write(pass_data);
          }

          request.end();
        })
      }
    });

    afterEach(async () => {
      await TestServer.end();
    });

    test("204 PUT item as JSON", async () => {
      const RequestData = { name: 'pineapple', update: { property: "price", value: "1.99" } }
      const response = await SendRequest('PUT', '/edit', RequestData);
      expect(response.statusCode).toBe(204);
    })

    /* 
    TODO: I need to implement this functionality in the application
    test("400 PUT client bad object", () => {
      expect(true).toBe(true);
    })

    test("400 PUT with Faulty client with JSON response", () => {
      expect(true).toBe(true);
    })

    */


    test("405 GET not allowed", async () => {
      const response = await SendRequest('GET', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 REMOVE not allowed", async () => {
      const response = await SendRequest('DELETE', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 POST not allowed", async () => {
      const response = await SendRequest('POST', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("500 Something went wrong ServerApp", async () => {
      ServerAppMock.create = () => { throw new Error("TEST THROW") };
      const response = await SendRequest('PUT', '/edit');

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message: "Internal Server Error" }));
      expect(true).toBe(true);
    })

  })

  /*
  - remove
    - GET 
      - 404 not supported
    - POST
      - 404 not supported
    - PUT
      - 404 not supported
    - DELETE
      - Logs deleted object
      - 201 valid object removed
        - Sends nothing
      - 400 something went wrong with the stream
        - Sends 400 error with stream issue
        - Sends a valid json object "Client Side Error"
      - 500 something went wrong internally
  */
  describe('/remove endpoint', () => {
    let ServerAppMock;
    let TestServer;
    let SendRequest;

    beforeEach(async () => {
      ServerAppMock = {
        groceries: [],
        del: jest.fn((_) => { }),
      };
      TestServer = new Server();
      await TestServer.start(ServerAppMock);
      // Race Condition in the test? How would I even go about solving this? 
      await new Promise((resolve) => setTimeout(resolve, 100));

      SendRequest = (method, url, pass_data = null) => {
        pass_data = JSON.stringify(pass_data);
        return new Promise((resolve, reject) => {

          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json",
              'Content-Length': pass_data ? Buffer.byteLength(pass_data) : 0
            }
          }

          const request = http.request(options, (res) => {
            let responseBody = '';
            res
              .on('data', (chunk) => {
                responseBody += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: responseBody });
              })
          });
          request.on("error", reject);

          if (pass_data) {
            request.write(pass_data);
          }

          request.end();
        })
      }
    });


    afterEach(async () => {
      await TestServer.end();
    });



    test("200 DELETE item as JSON", async () => {
      const RequestData = { name: 'pineapple' }
      const response = await SendRequest('DELETE', '/remove', RequestData);
      expect(response.statusCode).toBe(204);
    })

    /*
    // TODO: Implement this functionality at API level
    test("400 DELETE client bad object", () => {
      expect(true).toBe(true);
    })
    test("400 DELETE with Faulty client with JSON response", () => {
      expect(true).toBe(true);
    })
    */


    test("405 GET not allowed", async () => {
      const response = await SendRequest('GET', '/remove');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 POST not allowed", async () => {
      const response = await SendRequest('POST', '/remove');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 PUT not allowed", async () => {
      const response = await SendRequest('PUT', '/remove');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })


    test("500 Something went wrong ServerApp", async () => {
      ServerAppMock.del = () => { throw new Error("TEST THROW") };
      const response = await SendRequest('DELETE', '/remove');

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message: "Internal Server Error" }));
      expect(true).toBe(true);
    })

  })

  /*
  - toggle
    - PUT
      - Logs updated object
      - 201 valid updated object
        - Sends nothing
      - 400 something went wrong with the stream
        - Sends 400 error with stream issue
        - Sends a valid json object "Client Side Error"
      - 500 something went wrong internally
        - Sends a valid json object "Internal Server Error"
        - Doesn't crash the server
  */
  describe('/toggle endpoint', () => {
    let ServerAppMock;
    let TestServer;
    let SendRequest;

    beforeEach(async () => {
      ServerAppMock = {
        groceries: [],
        update: jest.fn((_, __) => { }),
      };
      TestServer = new Server();
      await TestServer.start(ServerAppMock);
      // Race Condition in the test? How would I even go about solving this? 
      await new Promise((resolve) => setTimeout(resolve, 100));

      SendRequest = (method, url, pass_data = null) => {
        pass_data = JSON.stringify(pass_data);
        return new Promise((resolve, reject) => {

          const options = {
            hostname: "localhost",
            port: 8080,
            path: url,
            method: method,
            headers: {
              'Content-Type': "application/json",
              'Content-Length': pass_data ? Buffer.byteLength(pass_data) : 0
            }
          }

          const request = http.request(options, (res) => {
            let responseBody = '';
            res
              .on('data', (chunk) => {
                responseBody += chunk;
              })
              .on('end', () => {
                resolve({ statusCode: res.statusCode, body: responseBody });
              })
          });
          request.on("error", reject);

          if (pass_data) {
            request.write(pass_data);
          }

          request.end();
        })
      }

    });

    afterEach(async () => {
      await TestServer.end();
    });


    test("204 PUT item as JSON", async () => {
      const RequestData = { name: 'pineapple' }
      const response = await SendRequest('PUT', '/edit', RequestData);
      expect(response.statusCode).toBe(204);
    })

    /*
    // TODO: Implement this functionality at API level
    test("400 PUT client bad object", () => {
      expect(true).toBe(true);
    })
    test("400 PUT with Faulty client with JSON response", () => {
      expect(true).toBe(true);
    })
    */


    test("405 GET not allowed", async () => {
      const response = await SendRequest('GET', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 REMOVE not allowed", async () => {
      const response = await SendRequest('DELETE', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("405 POST not allowed", async () => {
      const response = await SendRequest('POST', '/edit');

      expect(response.statusCode).toBe(405);
      expect(response.body).toBe(JSON.stringify({ message: 'Invalid Method type' }));
    })

    test("500 Something went wrong ServerApp", async () => {
      ServerAppMock.create = () => { throw new Error("TEST THROW") };
      const response = await SendRequest('PUT', '/toggle');

      expect(response.statusCode).toBe(500);
      expect(response.body).toBe(JSON.stringify({ message: "Internal Server Error" }));
      expect(true).toBe(true);
    })

  })

})
