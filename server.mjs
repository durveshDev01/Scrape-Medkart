import express from 'express';
import { scrapeMedkart, scrapePharmeasy, searchMedkart, searchPharmeasy } from './scrape.mjs';
import ejs from 'ejs';
import { createHash } from 'crypto';
import {User, agenda} from './config.js';
import cookieParser from 'cookie-parser';
import { compareSearch } from './compare.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import sessionConfig from './sessionConfig.js'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
let user;

const app = express();
app.set('view engine', 'ejs');
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded payloads

app.set('views', path.join(__dirname, 'ASEP-Frontend-FY'));
app.use('/static', express.static(path.join(__dirname + '/ASEP-Frontend-FY/static')));
app.use(cookieParser());
app.use(sessionConfig);

app.post('/signup', async (req, res) => { //Signup
  let { user, email, signupPassword, confirmPassword } = req.body;
  if (user = await User.findOne({ email: email })) res.render('login.ejs', {
    alertbox: "Email already exists"
  })
  else if (typeof(signupPassword) != undefined && signupPassword !== confirmPassword) res.render('login.ejs', {
    alertbox: "Password & Confirm Password doesn't match! Make sure the password matches"
  });
  else if (typeof (email) != undefined && typeof (user != undefined)) {
    user = await User({ email: email, name: user, password: createHash('sha256').update(signupPassword).digest('hex'), address: null }).save();
    req.session.user = {name: user, email: email};
    await req.session.save((err) => {
      if (err) console.log(err);
    })
    res.redirect('/')
  }
})



app.post('/signin', async (req, res) => { //SignIn
  User.find({ email: req.body.email }).then(async (user) => {
    if (user) {
      if (createHash('sha256').update(req.body.password).digest('hex') == user[0].password ){
        req.session.user = {name: user[0].user, email: user[0].email};
        await req.session.save((err) => {
          if (err) console.log(err);
        })
        res.redirect('/');
      }
      else {
        res.render('login.ejs', {
          alertbox: "Incorrect Password!!"
        });
      }
    }
  })
})



app.get('/', async (req, res) => {
  let med = await searchPharmeasy("TABLET");
  // console.log(req.session);
  res.render('home.ejs', {med: med, user: req.session.user});
})



app.get('/auth', async (req, res) => {
  res.render('login.ejs');
})



app.get('/search', async (req, res) => {
  let meds = await compareSearch(req.query.term);
  if (meds.length > 0) 
    res.render('searchpage.ejs', {meds: meds, user: req.session.user});
  else 
    res.render('searchpage.ejs', {meds: [{name: "No results found", manifacturer: "", price: "", discount: "", path: ""}], user: req.session.user});
})

app.get('/logout', async (req, res) => {
  req.session.destroy();
  res.redirect('/');
})

app.post('/order-medicine/:id', async (req, res) => {
  let data = req.body.medData;
  let med = JSON.parse(data);
  let phe = await scrapePharmeasy(med.phe.path);
  let mdk = await scrapeMedkart(med.mdk.path);
  // console.log(phe);
  res.render('productpage.ejs', {med: med, mdk: mdk, phe: phe, user: req.session.user});

})

app.get("/reminder",async(req, res) => {
  res.render("reminder.ejs", {});
})

app.post("/setReminder", async(req, res) => {
  const {medicine, email, datetime} = req.body;
  if(!medicine || !email || !datetime){
    return res.status(400).render("reminder.ejs", {message: "All fields are required!"});
  }
  const time = new Date(datetime);
  console.log(time);
  await agenda.schedule(time, "Sent Medication Reminder", {email, medicine, datetime});
  console.log(await agenda.jobs())
  res.render("reminder.ejs", { message: "Reminder scheduled successfully!" });
})

app.get('/get/pharmeasy/:id', async (req, res) => {
  res.json(await searchPharmeasy(req.params.id));
})

app.get('/info/pharmeasy/online-medicine-order/:id', async (req, res) => {
  res.json(await scrapePharmeasy("online-medicine-order/" + req.params.id));
})


app.get('/get/medkart/:id', async (req, res) => {
  res.json(await searchMedkart(req.params.id));
})

app.get('/info/medkart/order-medicine/:id', async (req, res) => {
  res.json(await scrapeMedkart("order-medicine/" + req.params.id));
})


app.listen(3000, () => console.log('Server started on port http://localhost:3000'));



app.get('/features', (req, res) => {
  res.render('features', { user: req.user }); // Assuming you are passing user data
});

app.get('/features', (req, res) => {
  res.render('map', { user: req.user }); // Assuming you are passing user data
});

// Add this code to your existing server.mjs file

// Route for the contact page
app.get('/contact', (req, res) => {
  res.render('contact', { user: req.session.user }); // Render the contact.ejs file
});

// Correct the route for the map page
app.get('/map', (req, res) => {
  res.render('map', { user: req.session.user }); // Render the mare.ejs file
});
