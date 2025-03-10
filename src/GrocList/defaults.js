
const defaultConfiguration = {
  console: true,
  storage: "local",
  logger: {
    info: (message) => console.log("Local Log: ", message),
    error: (message) => console.error("Local Log: ", message)
  },
}


module.exports = { defaultConfiguration }
