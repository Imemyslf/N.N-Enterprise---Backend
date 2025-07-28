import express from "express";
import { db, connectToDb } from "./database.js";
import cors from "cors";
import fs from "fs";
import path from "path";
import nodemailer from "nodemailer";
import os from "os";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import companyRoute from "../route/companyRoute.js";
import materialRoute from "../route/materialRoute.js";
import billingRoute from "../route/billingRoute.js";
import { upload } from "../middleware/upload.js";
import { deductDay, retrieveInvoice } from "../service/invoiceService.js";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 8000;

dotenv.config();
app.use(express.json());

app.use(express.static(path.join(__dirname, "../build")));

// console.log(process.env.USER_EMAIL);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

const dirPDF = path.join(path.join(os.homedir(), "Downloads"), "Invoice");

if (!fs.existsSync(dirPDF)) {
  fs.mkdirSync(dirPDF, { recursive: true }); // Ensures that nested directories are created
  console.log("Invoice directory created successfully at", dirPDF);
}

app.get(/^(?!\/api).+/, (req, res) => {
  res.sendFile(path.join(__dirname, "../build"));
});

app.get("/", (req, res) => {
  res.status(200).send("Hello");
});

app.use(`/api/company`,companyRoute);
app.use(`/api/materials`,materialRoute);
app.use(`/api/billings`,billingRoute);

app.post(`/api/invoice/upload`, upload.single("file"), async (req, res) => {
  console.log("Inside Invoice upload route");
  try {
    if (!req.file) {
      return res.status(400).send("No file Uploaded");
    }

    const filePath = req.file.path;
    console.log("File uploaded successfully at  ", filePath);

    const invoiceNos = req.body.invoiceNos;
    console.log("Inovoice Nos", invoiceNos);

    const extraInfo = JSON.parse(req.body.ExtraInfo);
    console.log("Extra Info:- \n", extraInfo);

    if (extraInfo) {
      try {
        const result = await db.collection("billings").updateOne(
          { invoiceNos: invoiceNos },
          {
            $set: {
              vehicleNos: extraInfo.vehicleNos,
              orderNos: extraInfo.orderNos,
              dueDate: extraInfo.dueDate,
            },
          }
        );
        if (result.modifiedCount > 0) {
          console.log("Extra info updated successfully");
        } else {
          console.log("No matching invoice found or no changes made");
        }
      } catch (e) {
        console.log("Error while updating extra info", e);
      }
    }

    const invoiceInfo = await db
      .collection("billings")
      .findOne({ invoiceNos: invoiceNos });
    if (invoiceInfo) {
      if (invoiceInfo.invoiceGenerated === true) {
        console.log("Invoice Generated");
        return res.status(200).send({ message: "Invoice Already Generated" });
      } else {
        const result = await db
          .collection("billings")
          .updateOne(
            { invoiceNos: invoiceNos },
            { $set: { invoiceGenerated: true } }
          );
        if (result.acknowledged) {
          console.log("Invoice updated successfully");
          return res.status(200).send({
            message: "Invoice Genrated Successfully",
            path: "DownloadsInvoice",
          });
        } else {
          console.log("Invoice updatedaion failed");
          return res.status(500).send("Invoice update failed");
        }
      }
    } else {
      console.log("Invoice not found");
      return res.status(404).send("Invoice not found");
    }

    res.status(200).send("Invoice updated and file uploaded successfully");
  } catch (e) {
    console.log(`Error message: \n ${e.message}`);
    res.status(500).send("Interna Server Error");
  }
});

app.get(`/api/sendMail`, async (req, res) => {
  const { email, invoice } = req.query;
  console.log(email, invoice);

  const file = await retrieveInvoice(`${invoice}.pdf`);

  if (file) {
    console.log("File found");
  }

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: email,
    subject: "Invoice",
    attachments: [{ filename: `${invoice}.pdf`, path: file }],
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.log(err);
    } else {
      console.log("Sent mail successfully");
      res.status(200).send(`Email received ${email}`);
    }
  });
});

//Checking db connect and server connection.
connectToDb(() => {
  console.log("Successfully connected to Database");
  deductDay();
  app.listen(port, "0.0.0.0", () => {
    console.log(`listening on port ${port}`);
  });
});
