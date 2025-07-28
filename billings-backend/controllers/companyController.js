import { db } from "../src/database.js";
import { ObjectId } from "mongodb";

const getCompanyDetails = async (req, res) => {
  console.log(`inside company`);
  const company = await db.collection("company").find({}).toArray();
  if (company.length > 0) {
    console.log(company);
    res.json(company);
  } else {
    res.sendStatus(404);
  }
};


const searchCompany =  async (req, res) => {
    let { name } = req.params;
    name = name.trim();
  
    try {
      const response = await db
        .collection("company")
        // .find({ name: { $regex: name, $options: "i" } })
        .find({ name: { $regex: name } })
        .toArray();
      console.log(`Company data found: ${JSON.stringify(response)}`);
      if (response.length > 0) {
        console.log(response);
        res.send(response);
      } else {
        res.status(404).send(`No companies found matching ${name}`);
      }
    } catch (e) {
      console.error(e);
      res.status(500).send(`Server error ${e}`);
    }
  };

const insertCompany = async (req, res) => {
    let { name, address, GSTNos, email, stateCode } = req.body;
    console.log(name, address, GSTNos, email, stateCode);
  
    name = name.trim();
    address = address.trim();
    GSTNos = GSTNos.trim();
    email = email.trim();
    stateCode = parseInt(stateCode, 10);
  
    const response = await db.collection("company").findOne({ name });
  
    if (response) {
      res.status(400).send(`Company already exists!!`);
    } else {
      const newComp = { name, address, GSTNos, email, stateCode };
      const result = await db.collection("company").insertOne(newComp);
      console.log(result);
      if (result.acknowledged) {
        console.log(result.acknowledged);
        console.log(`Successfully added`);
        res.status(200).send(newComp);
      } else {
        res.status(500).send("Failed to insert the company");
      }
    }
  };

const updateCompany = async (req, res) => {
    let { _id, name, address, GSTNos, email, stateCode } = req.body;
    console.log(
      "Before Update:- \n",
      _id,
      name,
      address,
      GSTNos,
      email,
      stateCode
    );
  
    console.log("Object id:- ", new ObjectId(_id));
  
    if (!ObjectId.isValid(_id)) {
      console.log("Invalid Id", id);
      return res.status(400).send("Invalid company ID");
    }
  
    _id = new ObjectId(_id);
    console.log("Object id:-", _id);
    name = name.trim();
    address = address.trim();
    GSTNos = GSTNos.trim();
    email = email.trim();
    stateCode = parseInt(stateCode, 10);
  
    try {
      console.log("Inside try");
      const update = await db
        .collection("company")
        .findOneAndUpdate(
          { _id: _id },
          { $set: { name, address, GSTNos, email, stateCode } },
          { returnOriginal: true }
        );
      console.log(update);
      if (update) {
        console.log("After update:- \n", update);
        res.status(200).json(update);
      }
    } catch (e) {
      console.log("Error in server", e.message);
    }
  };

const deleteCompanyByName = async (req, res) => {
    const { name } = req.params;
    console.log(`inside delete company:- `, name);
    try {
      const result = await db.collection("company").deleteOne({ name });
      if (result.deletedCount === 0) {
        res.status(200).send({ message: "No documents to be deleted" });
      }
  
      res.status(200).send(result);
    } catch (err) {
      res.status(404).send(err);
    }
  };

const deleteAllCompany = async (req, res) => {
  try {
    const result = await db.collection("company").deleteMany({});
    if (result.deletedCount === 0) {
      res.status(200).send({ message: "No documents to be deleted" });
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
};

const sortCompany =  async (req, res) => {
  console.log(`inside sort`);
  const { methods, sorting } = req.query; // Using req.query for query parameters
  const sort = sorting === "asc" ? 1 : -1;

  let type = "";

  if (methods === "stateCode") {
    type = "stateCode";
  } else if (methods === "GSTNos") {
    type = "GSTNos";
  } else if (methods === "email") {
    type = "email";
  } else {
    type = "name"; // default to name
  }

  try {
    const companies = await db
      .collection("company")
      .find({})
      .sort({ [type]: sort }) // Use [type] for dynamic field sorting
      .toArray();

    console.log(`companies:- \n`, companies);
    if (companies.length > 0) {
      res.send(companies);
    } else {
      res.sendStatus(404);
    }
  } catch (err) {
    console.log(err.message);
  }
};

export { getCompanyDetails, searchCompany, insertCompany, updateCompany, deleteCompanyByName, deleteAllCompany, sortCompany };