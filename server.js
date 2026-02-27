// 1️⃣ Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// We'll comment out nodemailer for now on Render free plan
// const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ MongoDB Connection (Mongoose v7 compatible)
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected ✅"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// 4️⃣ Schema
const ContactSchema = new mongoose.Schema({
  name: String,
  number: String,
  email: String,
  message: String,
  createdAt: { type: Date, default: Date.now }
});

const Contact = mongoose.model("Contact", ContactSchema);

// 5️⃣ Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// 6️⃣ Contact form route
app.post("/contact", async (req, res) => {
  try {
    const { name, number, email, message } = req.body;

    if (!name || !number || !email || !message) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    // Save to MongoDB
    const newContact = new Contact({ name, number, email, message });
    await newContact.save();
    console.log("Saved to MongoDB ✅");

    // 🔹 EMAILS ARE DISABLED FOR RENDER FREE PLAN
    // To enable emails safely, use SendGrid API
    // Example:
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({ to: email, from: process.env.EMAIL_USER, subject: "...", text: "..." });

    res.json({ success: true, message: "Message saved successfully ✅" });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 7️⃣ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});