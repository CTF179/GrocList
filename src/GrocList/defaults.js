
const defaultConfiguration = {
  console: true,
  storage: "local",
  logger: {
    info: (message) => console.log(message),
    error: (message) => console.error(message)
  },
}


module.exports = { defaultConfiguration }
