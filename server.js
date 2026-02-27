require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


// ✅ EMAIL TRANSPORTER
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


// ✅ MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected ✅"))
.catch(err => console.log(err));


// ✅ Schema
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


// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Backend is working!");
});


// ✅ CONTACT FORM
app.post("/contact", async (req, res) => {

try {

const { name, number, email, message } = req.body;


// ✅ SAVE TO MONGODB
const newContact = new Contact({
  name,
  number,
  email,
  message
});

await newContact.save();

console.log("Saved to MongoDB ✅");


// ✅ SEND EMAIL
const mailOptions = {

  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER, // your email receives message

  subject: "New Website Contact Message",

  text: `
Name : ${name}
Number : ${number}
Email : ${email}
Message : ${message}
`
};

await transporter.sendMail(mailOptions);
const autoReply = {

from: process.env.EMAIL_USER,
to: email,

subject:"Thank you for contacting NOVIQUE SPACES",

text:`
Hi ${name},

Thank you for contacting NOVIQUE SPACES.

We received your message and will contact you soon.

Regards,
NOVIQUE SPACES
`

};

await transporter.sendMail(autoReply);

console.log("Email Sent ✅");


// ✅ RESPONSE
res.json({
success:true,
message:"Message sent successfully ✅"
});

}catch(error){

console.log(error);

res.status(500).json({
success:false,
message:"Error saving form"
});

}

});


// ✅ SERVER START
app.listen(PORT, () => {
console.log(`Server running on port ${PORT}`);
});