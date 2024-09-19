import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
  service: "gmail", // ใช้ Gmail service
  port: 465,
  secure: true, // ใช้ SSL/TLS
  auth: {
    user: process.env.EMAIL_USER, // ใช้ env variable แทนค่าคงที่
    pass: process.env.EMAIL_PASS, // ใช้ env variable แทนค่าคงที่
  },
});

export const sendPasswordResetEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"Your App Name" ${process.env.EMAIL_USER}`, // ส่งจากอีเมลของคุณ
    to: email,
    subject: "Password Reset Request",
    text: `You are receiving this email because you (or someone else) have requested to reset the password for your account.

Please click on the following link to reset your password:
${resetUrl}

If you did not request this, please ignore this email and your password will remain unchanged.`,

    html: `<p>You are receiving this email because you (or someone else) have requested to reset the password for your account.</p>
<p>Please click on the following link to reset your password:</p>
<p><a href="${resetUrl}">${resetUrl}</a></p>
<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Password reset email sent successfully.");
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
