import mongoose from 'mongoose';
const  DB_NAME  = "dataprovider";
console.log(DB_NAME,process.env.MONGODB_URI);
/** @type {typeof mongoose | undefined} */
 let dbInstance = undefined;
 let dbConnected = false;
const connectDB = async () => {
  try {
    // const connectionInstance = await mongoose.connect(
    //   `${'mongodb+srv://.m44psuo.mongodb.net'}/${DB_NAME}`
    // );

    const connectionInstance = await mongoose.connect(
      `${'mongodb://ramesh:ramesh@localhost:27017'}/${DB_NAME}?authSource=admin`
    );
    
    dbInstance = connectionInstance;
    dbConnected = true;
    console.log(
      `\n☘️  MongoDB Connected! Db host: ${connectionInstance.connection.host}\n`
    );
    return {dbConnected, dbInstance};
  } catch (error) {

    console.log("MongoDB connection error, Mongo DB is not available");
    console.log(error);
    return {dbConnected, dbInstance};
   // process.exit(1);
  }
};

export { connectDB };
