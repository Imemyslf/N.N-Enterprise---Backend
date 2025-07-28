import { db } from "../src/database.js";
import { Decimal128 } from "mongodb";

const getNextInvoiceNos = async () => {
  const result = await db
    .collection("counters")
    .findOneAndUpdate(
      { _id: "invoiceNos" },
      { $inc: { seq: 1 } },
      { returnOriginal: false }
    );

  return result.seq;
};

const getBillDetails = async (req, res) => {
  const billings = await db.collection("billings").find({}).toArray();
  if (billings.length > 0) {
    // console.log(billings);
    res.send(billings);
  } else {
    res.sendStatus(404);
  }
};

const serachBillByInvoiceNos = async (req, res) => {
    let { invoiceNos } = req.params;
    console.log(`invoiceNos;- ${invoiceNos}`);
  
    const response = await db.collection("billings").findOne({ invoiceNos });
  
    if (response) {
      console.log(response);
      res.json(response);
    } else {
      res.status(404).send(`Invoice nos ${invoiceNos} not found`);
    }
  };

const insertBill = async (req, res) => {
    console.log("Request Body:", req.body);
    let { companyName, companyMaterials } = req.body;
    companyName = companyName.trim();
  
    if (!companyName || !Array.isArray(companyMaterials)) {
      return res.status(400).send("Missing required fields");
    }
  
    console.log(companyName, companyMaterials);
  
    const companyInfo = await db
      .collection("company")
      .findOne({ name: { $regex: new RegExp(companyName, "i") } });
  
    if (!companyInfo) {
      console.log(` Companyinfo failed:- ${companyInfo}`);
      return res.status(400).send("Company does not exist");
    }
    console.log(`Company info insdie insert`, companyInfo);
  
    const updatedMaterials = [];
    for (let i = 0; i < companyMaterials.length; i++) {
      let { name, kg } = companyMaterials[i];
      name = name.trim();
      kg = Decimal128.fromString(parseFloat(kg.toString().trim()).toFixed(2));
  
      const material = await db
        .collection("materials")
        .findOne({ name: { $regex: new RegExp(name, "i") } });
      console.log(`Materials inside insert`, material);
      if (!material) {
        return res.status(400).send(`Material ${name} does not exist`);
      }
  
      const { _id, ...restOfMaterials } = material;
      updatedMaterials.push({ ...restOfMaterials, kg });
    }
  
    console.log(`\n\nFinal updatedMaterials:- `, updatedMaterials);
    const newInvoiceNos = await getNextInvoiceNos();
    const daysLeft = 31;
    const invoiceGenerated = false;
  
    const { _id, name, ...restOfCompanyInfo } = companyInfo;
  
    const date = new Date().toLocaleDateString();
    const time = new Date().toLocaleTimeString();
    const newBill = {
      invoiceNos: newInvoiceNos.toString(),
      companyName,
      ...restOfCompanyInfo,
      companyMaterials: updatedMaterials,
      date,
      time,
      daysLeft,
      invoiceGenerated,
    };
  
    console.log(`\n\nNewbill:- `, newBill);
    try {
      const result = await db.collection("billings").insertOne(newBill);
      // console.log(`Result:- ${JSON.stringify(result, null, 2)}}`);
  
      if (result.acknowledged) {
        // console.log(result.acknowledged);
        res.status(201).send(newBill);
      } else {
        console.log(result.status);
        res.status(500).send(`Failed to insert the materials`);
      }
    } catch (err) {
      console.error("Error during insertion:", err); // Log error details
      res.status(500).send("Internal Server Error");
    }
  };

const paidBillAmount = async (req, res) => {
    console.log("inside paid");
    const { invoiceNos } = req.params;
    // const new_invoice = parseInt(invoiceNos, 10);
    try {
      const response = await db
        .collection("billings")
        .updateOne(
          { invoiceNos: invoiceNos },
          { $set: { invoiceGenerated: true } }
        );
  
      if (response.acknowledged) {
        console.log(`inside paid:-`, response);
        res.status(200).send(response);
      } else {
        res.status(400).send({ message: "Error updating billings" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).send({ message: "Internal Server Error" });
    }
  };

const deleteByInvoiceNos =  async (req, res) => {
  let { invoiceNos } = req.params;
  console.log(`invoice nos inside delete:- `, invoiceNos);
  try {
    const result = await db
      .collection("billings")
      .deleteOne({ invoiceNos: invoiceNos });

    console.log(`result after deletion`, result);

    if (result.deletedCount === 0) {
      return res.status(200).send(result);
    }
    console.log("Deleted successfully");
    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
};

const deleteAllBill = async (req, res) => {
  try {
    const result = await db.collection("billings").deleteMany({});
    if (result.deletedCount === 0) {
      res.status(200).send({ message: "No documents to be deleted" });
    }

    res.status(200).send(result);
  } catch (err) {
    res.status(404).send(err);
  }
};

export {getBillDetails, serachBillByInvoiceNos, insertBill, paidBillAmount, deleteByInvoiceNos, deleteAllBill};