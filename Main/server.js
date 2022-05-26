
const express = require('express');
const sequelize = require('../config/connection');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
// do i need the urlencoded below?
app.use(express.urlencoded({ extended: true }));

sequelize.sync().then(() => {
    app.listen(PORT, () => console.log('Now listening'));
  });

