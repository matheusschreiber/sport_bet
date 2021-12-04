const express = require('express');
const cors = require('cors');
const router = require('./routes');
require('express-async-errors')

const app = express();


app.use(express.json());
app.use(cors());
app.use(router);



app.use((err, req, res, next) =>{
  if (err instanceof Error) {
    return res.status(400).json({error: "Problems with request sintax"})
  } else {
    return res.status(500).json({error: "Internal server error"})
  }
})

app.listen(8080, console.log("Backend on port 8080"));