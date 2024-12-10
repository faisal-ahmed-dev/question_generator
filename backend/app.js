// server.js
const express = require('express');
const mongoose = require('mongoose');
const router = require('./src/routes/v1/index.js');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const port = process.env.PORT || 3000;

let OPTION = { user: "", pass: "", autoIndex: false };

mongoose
  .connect("mongodb://localhost:27017/questionMaker", OPTION)
  .then((res) => {
    console.log("Database Connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.use(
  cors({
    origin: ['http://localhost:5173'],
    credentials: true,
  })
);

app.use("/api/v1", router);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});

app.listen(port, () => {
  console.log(`listening to port ${port}`);
});
