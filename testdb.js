import mongoose from "mongoose";
import dns from "dns";

// First, test DNS resolution
const testDns = async () => {
  console.log("Testing DNS resolution...");
  try {
    const servers = await dns.promises.resolveSrv("_mongodb._tcp.moses.tyv67.mongodb.net");
    console.log("SRV records found:", servers);
    return true;
  } catch (error) {
    console.error("DNS resolution failed:", error.message);
    return false;
  }
};

// Then test MongoDB connection
const testConnection = async () => {
  const uri = "mongodb+srv://neroucrop:Edward12@moses.tyv67.mongodb.net/neroucrop";
  
  console.log("Testing MongoDB connection...");
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    });
    console.log("Connection successful!");
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.error("Connection failed:", error.message);
    return false;
  }
};

// Run tests
(async () => {
  await testDns();
  await testConnection();
  process.exit(0);
})(); 