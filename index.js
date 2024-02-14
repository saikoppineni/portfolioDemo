require('dotenv').config();
const bodyParser = require('body-parser');
const express=require('express');
const nodemailer = require('nodemailer');
const pg = require('pg');

const { Pool } = pg;
const pool = new Pool({
  connectionString: process.env.POSTGRES_URL + "?sslmode=require",
});
pool.connect((err)=>{
  if(err) console.log(err);
  else console.log('connection successful')
});

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

function sendingMail(name,email,comment){
let transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD
    }
});
let mailOptions = {
    from: process.env.USER,
    to: process.env.USER,
    subject: `Name : ${name}`,
    text: `Name : ${name}\nEmail : ${email}\nComment : ${comment}\n`
};
transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
        return console.log('Error occurred:', error);
    }
    console.log('Email sent:', info.response);
});


  pool.query('insert into visitors(name,email,comment) values($1,$2,$3)',[name,email,comment], (result, err) => {
    if (err) console.log(err);
    else console.log('data updated successfully');
  })

}

app.get('/',(req,res)=>{
  res.sendFile('./public/index.html');
});

app.post('/sendMail',(req,res)=>{
  const name= req.body.name
  const email= req.body.email;
  const comment=req.body.comment;
  sendingMail(name,email,comment);
  res.redirect('/')
});

app.listen(port,()=>{
  console.log('server running');
});
