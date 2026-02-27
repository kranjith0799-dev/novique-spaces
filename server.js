// 1️⃣ Load environment variables
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
// Optional SendGrid - ready to uncomment later
// const sgMail = require("@sendgrid/mail");

const app = express();
const PORT = process.env.PORT || 5000;

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ MongoDB Connection
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

    // 🔹 OPTIONAL EMAILS (SendGrid)
    /*
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    // Send email to admin
    const adminMsg = {
      to: process.env.EMAIL_USER,
      from: process.env.EMAIL_USER,
      subject: "New Website Contact Message",
      text: `Name: ${name}\nNumber: ${number}\nEmail: ${email}\nMessage: ${message}`
    };
    await sgMail.send(adminMsg);

    // Auto-reply to user
    const userMsg = {
      to: email,
      from: process.env.EMAIL_USER,
      subject: "Thank you for contacting NOVIQUE SPACES",
      text: `Hi ${name},\n\nThank you for contacting NOVIQUE SPACES.\nWe received your message and will contact you soon.\n\nRegards,\nNOVIQUE SPACES`
    };
    await sgMail.send(userMsg);

    console.log("Emails Sent ✅");
    */

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