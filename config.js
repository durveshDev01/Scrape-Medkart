import mongoose from "mongoose";
import Agenda from "agenda";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
mongoose.connect(
  "mongodb+srv://durveshDev01:dbDurvesh0001@college-project.dijxg.mongodb.net/?retryWrites=true&w=majority&appName=College-Project"
);

const UserSchema = mongoose.Schema({
  email: String,
  name: String,
  password: String,
  address: [String],
});
const User = mongoose.model("User", UserSchema);
var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

const agenda = new Agenda({
  db: {
    address:
      "mongodb+srv://durveshDev01:dbDurvesh0001@college-project.dijxg.mongodb.net/?retryWrites=true&w=majority&appName=College-Project",
    collection: "jobs",
  },
  processEvery: '1 minute',
});

agenda.on('ready', async () => {
  await agenda.start();
});

agenda.define("Sent Medication Reminder", async (job) => {
  const { email, medicine, datetime } = job.attrs.data;
  var mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Medicine Reminder",
    text: `Reminder: Hello "${email}"! This is a reminder to take your prescribed dosage of "${medicine}" at ${datetime}`,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
});


(async function () {
  await agenda.start();
  console.log("Agenda scheduler started...");
})();


export { User, agenda };
