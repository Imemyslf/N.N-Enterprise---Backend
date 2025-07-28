import { Decimal128 } from "mongodb";
import { db } from "../src/database.js";
import { ObjectId } from "mongodb";

const getMaterailDetails = async (req, res) => {
  const materials = await db.collection("materials").find().toArray();
  if (materials.length > 0) {
    console.log(materials);
    res.send(materials);
  } else {
    res.sendStatus(404);
  }
};

const searchMaterial =  async (req, res) => {
    let { name } = req.params;
    console.log(name);
    name = name.trim();
    try {
      const response = await db
        .collection("materials")
        .find({ name: { $regex: name, $options: "i" } })
        .toArray();
      console.log(response);
      console.log(`Materials data found: ${JSON.stringify(response)}`);
  
      if (response.length > 0) {
        console.log(response);
        res.send(response);
      } else {
        res.status(404).send(`No materials found matching ${name}`);
      }
    } catch (err) {
      console.error(err.message);
      res.status(500).send(`Server error ${err}`);
    }
  };

const insertMaterial = async (req, res) => {
    let { name, rate, kg } = req.body;
    console.log(name, rate, kg);

    // Trim and validate input
    name = name.trim();
    rate = parseFloat(rate.toString().trim());
    kg = parseInt(kg.trim(), 10);

    if (isNaN(rate) || isNaN(kg)) {
        return res.status(400).send("Rate and Kg must be valid numbers.");
    }

    const decimalRate = Decimal128.fromString(rate.toFixed(2));

    // Check if material already exists
    const response = await db.collection("materials").findOne({ name });

    if (response) {
        return res.status(400).send(`Material already exists!`);
    }

    // Capitalize the name
    const newName = name.charAt(0).toUpperCase() + name.slice(1);
    console.log(newName);

    // Prepare the new material object
    const newMate = { name: newName, rate:decimalRate, kg };
    console.log(newMate);

    // Insert new material into the database
    const result = await db.collection("materials").insertOne(newMate);

    if (result.acknowledged) {
        console.log("Material Added successfully");
        res.status(201).send(newMate);
    } else {
        res.status(500).send("Failed to insert the material");
    }
};

const updateMaterial =  async (req, res) => {
    let { _id, name, rate, kg } = req.body;
    console.log("Before Update:- \n", _id, name, rate, kg);
  
    console.log("Object id:- ", new ObjectId(_id));
  
    if (!ObjectId.isValid(_id)) {
      console.log("Invalid Id", id);
      return res.status(400).send("Invalid company ID");
    }
  
    _id = new ObjectId(_id);
    console.log("Object id:-", _id);
    name = name.trim();
    rate = Decimal128.fromString(parseFloat(rate.trim()).toFixed(2));
    kg = parseInt(kg.trim(), 10);
  
    try {
      console.log("Inside try");
      const update = await db
        .collection("materials")
        .findOneAndUpdate(
          { _id: _id },
          { $set: { name, rate, kg } },
          { returnDocument: "after" }
        );
      console.log(update);

      if (update && update.value) {
        console.log("After update:- \n", update.value);
        res.status(200).json(update.value);
      }
    } catch (e) {
      console.log("Error in server", e.message);
    }
  };

const deleteMaterialByName = async (req, res) => {
  const { name } = req.params;
  try {
    const result = await db.collection("materials").deleteOne({ name });
    if (result.deletedCount === 0) {
      res.status(200).send({ message: "No documents to be deleted" });
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
};

const deleteAllMaterial =  async (req, res) => {
  try {
    const result = await db.collection("materials").deleteMany({});
    if (result.deletedCount === 0) {
      res.status(200).send({ message: "No documents to be deleted" });
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
};

const sortMaterial = async (req, res) => {
    console.log(`inside sort`);
    const { methods, sorting } = req.query; // Using req.query for query parameters
    const sort = sorting === "asc" ? 1 : -1;
  
    let type = "";
  
    if (methods === "rate") {
      type = "rate";
    } else {
      type = "name"; // default to name
    }
  
    try {
      const materials = await db
        .collection("materials")
        .find({})
        .sort({ [type]: sort }) // Use [type] for dynamic field sorting
        .toArray();
  
      console.log(`materials:- \n`, materials);
      if (materials.length > 0) {
        res.send(materials);
      } else {
        res.sendStatus(404);
      }
    } catch (err) {
      console.log(err.message);
    }
  };

export { getMaterailDetails, searchMaterial, insertMaterial, updateMaterial, deleteMaterialByName, deleteAllMaterial, sortMaterial};