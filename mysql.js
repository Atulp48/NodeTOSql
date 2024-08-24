const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const dbConfig = {
  host: process.env.HOST_NAME,
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_NAME,
};

let jsonData = null;
const table = process.env.TABLE_NAME;
const column = process.env.COLUMN_NAME;
const fetchDataAndConvertToJson = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    // const [rows] = await connection.execute(`SELECT * FROM ${table}`);
    const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
    // const [rows] = await connection.execute(`
    //     SELECT * FROM ${table}
    //     ORDER BY ${column} DESC
    //     LIMIT 20
    //   `);
    console.log(rows)
    jsonData = JSON.stringify(rows, null, 2);
    console.log("data comming");
    // console.log("JSON Data:", jsonData);
    await connection.end();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};
const startAutoFetch = () => {
  fetchDataAndConvertToJson();
  setInterval(fetchDataAndConvertToJson, 1000 * 10);
  //   setInterval(fetchDataAndConvertToJson, 1000*60*60*24);
};
app.get("/getdata", (req, res) => {
  if (jsonData) {
    res.status(200).json({
      success: true,
      message: "data fetches successfully",
      data: JSON.parse(jsonData),
    });
  } else {
    res
      .status(404)
      .json({ success: false, message: "Data is not yet available." });
  }
});
app.listen(process.env.PORT_NAME || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT_NAME || 9000}`);
  //   startAutoFetch();
  fetchDataAndConvertToJson();
});
