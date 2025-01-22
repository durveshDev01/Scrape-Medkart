import express from 'express';
import { scrapeMedkart, scrapePharmeasy, searchMedkart, searchPharmeasy } from './scrape.mjs';
import ejs from 'ejs';
import { createHash } from 'crypto';
import {User} from './config.js';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { compareSearch, compareProd } from './compare.mjs';
import path from 'path';
import { fileURLToPath } from 'url';
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
app.use(session({
  secret: "durvesh",
  saveUninitialized: true,
  resave: true
}));



app.post('/signup', async (req, res) => {
  console.log(req.body);
  let { user, email, signupPassword, confirmPassword } = req.body;
  console.log(user, email, signupPassword, confirmPassword);
  if (user = await User.findOne({ email: email })) res.render('login.ejs', {
    alertbox: "Email already exists"
  })
  else if (typeof(signupPassword) != undefined && signupPassword !== confirmPassword) res.render('login.ejs', {
    alertbox: "Password & Confirm Password doesn't match! Make sure the password matches"
  });
  else if (typeof (email) != undefined && typeof (user != undefined)) {
    user = await User({ email: email, name: user, password: createHash('sha256').update(signupPassword).digest('hex'), address: null }).save();
    req.session.user = user;
    req.session.email = email;
    res.redirect('/')
  }
})



app.post('/signin', async (req, res) => {
  User.find({ email: req.body.email }).then((user) => {
    if (user) {
      console.log(user);
      if (createHash('sha256').update(req.body.password).digest('hex') == user[0].password ){
        req.session.user = user.user;
        req.session.email = user.email;
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
  console.log(med);
  res.render('home.ejs', {med: med});
})



app.get('/auth', async (req, res) => {
  res.render('login.ejs');
})



app.get('/search', async (req, res) => {
  let meds = await compareSearch(req.query.term);
  console.log(meds);
  if (meds.length > 0) 
    res.render('searchpage.ejs', {meds: meds});
  else 
    res.render('searchpage.ejs', {meds: [{name: "No results found", manifacturer: "", price: "", discount: "", path: ""}]});
})



app.post('/order-medicine/:id', async (req, res) => {
  let data = req.body.medData;
  let med = JSON.parse(data);
  let phe = await scrapePharmeasy(med.phe.path);
  let mdk = await scrapeMedkart(med.mdk.path);
  // console.log(phe);
  console.log(mdk);
  res.render('productpage.ejs', {med: med, mdk: mdk, phe: phe});

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
