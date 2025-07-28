import { MongoClient } from "mongodb";
import dotenv from "dotenv";
let db;

dotenv.config();
async function connectToDb(cb) {
  console.log(`${process.env.MONGODB_USER} ${process.env.MONGODB_PASS}`);
  // const client = new MongoClient(`mongodb://127.0.0.1:27017`);
  const client = new MongoClient(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.p8yp8.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`
  );
  await client.connect();

  db = client.db("dCompany");
  cb();
}

export { db, connectToDb };
