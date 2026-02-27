// 1️⃣ Load environment variables first
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// 2️⃣ Middleware
app.use(cors());
app.use(express.json());

// 3️⃣ EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// 4️⃣ MONGODB CONNECTION
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.error("MongoDB Connection Error:", err));

// 5️⃣ SCHEMA
const ContactSchema = new mongoose.Schema({
  name: String,
  number: String,
  email: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Contact = mongoose.model("Contact", ContactSchema);

// 6️⃣ Test route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});

// 7️⃣ Contact form route
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

    // Send email to you
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Website Contact Message",
      text: `Name: ${name}\nNumber: ${number}\nEmail: ${email}\nMessage: ${message}`
    };
    await transporter.sendMail(mailOptions);

    // Auto-reply to user
    const autoReply = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank you for contacting NOVIQUE SPACES",
      text: `Hi ${name},\n\nThank you for contacting NOVIQUE SPACES.\nWe received your message and will contact you soon.\n\nRegards,\nNOVIQUE SPACES`
    };
   // await transporter.sendMail(autoReply);

    console.log("Email Sent ✅");

    res.json({ success: true, message: "Message sent successfully ✅" });

  } catch (error) {
    console.error("CONTACT ERROR:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// 8️⃣ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});