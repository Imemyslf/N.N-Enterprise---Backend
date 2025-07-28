
import nodemailer from "nodemailer";
import { db } from "../src/database.js";

const deductDay = async () => {
    try {
      const response = await db.collection("billings").find({}).toArray();
      if (response.length > 0) {
        const currentDate = new Date();
        for (const billInfo of response) {
          const date = billInfo.date.split("/");
          const old_date = new Date(date[2], date[1] - 1, date[0]);
          const timeDiff = Math.floor(
            (currentDate - old_date) / (1000 * 60 * 60 * 24)
          );
  
          const dayLeft = 31 - timeDiff;
  
          if (timeDiff <= 31) {
            await db
              .collection("billings")
              .updateOne(
                { invoiceNos: billInfo.invoiceNos },
                { $set: { daysLeft: dayLeft } }
              );
          }
  
          if (billInfo.daysLeft === 0) {
            await db
              .collection("billings")
              .deleteOne({ invoiceNos: billInfo.invoiceNos });
  
            console.log(`Invoice deleted: ${billInfo.invoiceNos}`);
          }
          console.log(`${billInfo.invoiceNos}:- ${billInfo.daysLeft}`);
        }
      }
    } catch (err) {
      console.error(`Error: ${err}`);
    }
  };

const retrieveInvoice = async (invoiceFileName) => {
    // const homeDir = os.homedir();
    // const downloadsDir = path.join(homeDir, "Downloads", "Invoice");
    const invoicePath = path.join(dirPDF, invoiceFileName);
  
    try {
      // Check if the file exists
      try {
        await fs.promises.access(invoicePath);
        console.log("File exists.");
      } catch (err) {
        console.error("File does not exist.");
        return null;
      }
  
      if (result) {
        console.log(`Invoice ${invoiceFileName} read successfully.`);
      } else {
        console.log(`Invoice ${invoiceFileName} read not  successfully.`);
      }
  
      // Return the path instead of the buffer
      return invoicePath;
    } catch (error) {
      console.error(`Error retrieving invoice: ${error.message}`);
      return null;
    }
  };
  
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for port 465, false for other ports
    auth: {
      user: process.env.USER_EMAIL,
      pass: process.env.USER_PASS,
    },
  });


export {deductDay, retrieveInvoice};