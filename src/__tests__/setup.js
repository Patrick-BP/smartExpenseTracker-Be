const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod;

module.exports = async () => {
  // Create an in-memory MongoDB instance
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Set the MongoDB URI for tests
  global.__MONGO_URI__ = uri;
};

module.exports.teardown = async () => {
  // Stop the MongoDB instance
  await mongod.stop();
};