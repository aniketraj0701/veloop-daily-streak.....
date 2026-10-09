const mongoose = require('mongoose');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/veloop_rewards';
    const useMemoryDb = process.env.USE_MEMORY_DB === 'true';

    const memoryDbOptions = {
      instance: {
        dbName: 'veloop_rewards',
      },
      binary: {
        downloadDir: path.resolve(__dirname, '../.cache/mongodb-binaries'),
        systemBinary: process.env.MONGOD_SYSTEM_BINARY || '/opt/homebrew/bin/mongod',
      },
    };

    if (useMemoryDb) {
      console.log('ℹ️ Starting in-memory MongoDB instance for development/testing...');
      mongoMemoryServer = await MongoMemoryServer.create(memoryDbOptions);
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Connected to In-Memory MongoDB: ${uri}`);
      return;
    }

    try {
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 2000,
      });
      console.log(`✅ MongoDB Connected to: ${conn.connection.host}/${conn.connection.name}`);
    } catch (directConnErr) {
      console.warn(`⚠️ Primary MongoDB unavailable at ${mongoUri}. Starting embedded engine...`);
      mongoMemoryServer = await MongoMemoryServer.create(memoryDbOptions);
      const uri = mongoMemoryServer.getUri();
      await mongoose.connect(uri);
      console.log(`✅ Embedded In-Memory MongoDB is running: ${uri}`);
    }
  } catch (error) {
    console.error(`❌ Database Connection Fatal Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

module.exports = { connectDB, disconnectDB };
