require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const otpMap = new Map(); // Tempat untuk menyimpan OTP sementara

// Konfigurasi transporter Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail', // Bisa diganti dengan layanan email lain
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Fungsi untuk mengirim OTP melalui email
function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });
}

// Endpoint untuk menghasilkan dan mengirim OTP
app.post('/send-otp', (req, res) => {
  const email = req.body.email;
  const otp = crypto.randomInt(100000, 999999).toString(); // Menghasilkan OTP 6 digit

  // Simpan OTP dan email dalam map
  otpMap.set(email, otp);

  // Kirim OTP ke email
  sendOTP(email, otp);

  res.status(200).send('OTP has been sent.');
});

// Endpoint untuk verifikasi OTP
app.post('/verify-otp', (req, res) => {
  const email = req.body.email;
  const otp = req.body.otp;

  // Verifikasi OTP
  if (otpMap.get(email) === otp) {
    otpMap.delete(email); // Hapus OTP setelah verifikasi sukses
    res.status(200).send('OTP verified successfully.');
  } else {
    res.status(400).send('Invalid OTP.');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
