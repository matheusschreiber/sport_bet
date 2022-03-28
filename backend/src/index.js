const express = require('express');
require('express-async-errors');
//these two needs to be in this order!!!!!

const dotenv = require('dotenv')
dotenv.config()

const cors = require('cors');
const router = require('./routes');

const app = express();
app.use(express.json());
app.use(cors({client:'https://sport-bet.vercel.app/'}));
// app.use(cors());
app.use(router);

app.use((err, req, res, next) =>{ 
  if (err instanceof Error) {
    return res.status(400).json({error: err.message})
  } else {
    return res.status(500).json({error: "Internal server error"})
  }
})

app.listen(process.env.PORT || 8080, ()=>console.log("Backend on port 8080"));