const mongoose = require('mongoose');

global.isMockDB = false;
global.mockDbStore = {
  users: [],
  emails: []
};

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.warn('\n⚠️  No MONGODB_URI found in environment variables.');
    console.log('⚡ Running in In-Memory Mock Database Mode. All changes will persist during the server lifecycle.\n');
    global.isMockDB = true;
    return;
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log(`\n✅ MongoDB Connected: ${conn.connection.host}\n`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.log('⚡ Falling back to In-Memory Mock Database Mode. No database installation required to run!\n');
    global.isMockDB = true;
  }
};

module.exports = connectDB;
