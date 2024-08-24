const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "user",
  database: "college",
};

let jsonData = null;
const table = "Efficiencies";
const column = "id";
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
const app = express();
app.use(cors());
app.get("/getdata", (req, res) => {
  if (jsonData) {
    res
      .status(200)
      .json({
        success: true,
        message: "data fetches successfully",
        data: JSON.parse(jsonData),
      });
  } else {
    res
      .status(503)
      .json({ success: false, message: "Data is not yet available." });
  }
});
app.listen(8000, () => {
  console.log("Server is running on port 8000");
  //   startAutoFetch();
  fetchDataAndConvertToJson();
});
