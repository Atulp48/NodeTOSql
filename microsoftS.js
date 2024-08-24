// this is for sql server authentication

const sql = require("mssql");
const express = require("express");
const cors = require("cors");

const dbConfig = {
  user: "user",
  password: "root",
  server: "ATUL",
  database: "learning",
  options: {
    encrypt: true,
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: "SQLEXPRESS",
  },
  port: 1433,
};

let jsonData = null;
const table = "dashboard";
const column = "id";

const fetchDataAndConvertToJson = async () => {
  try {
    const pool = await sql.connect(dbConfig);

    // const result = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
    const result = await pool.request().query(`SELECT TOP 2 * FROM ${table}`);
    // const result = await pool.request().query(`SELECT TOP 20 * FROM ${table} ORDER BY ${column} DESC`);

    jsonData = JSON.stringify(result.recordset, null, 2);
    console.log("Data fetched and converted to JSON.");
    console.log(jsonData);
    await pool.close();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const startAutoFetch = () => {
  fetchDataAndConvertToJson();
  setInterval(fetchDataAndConvertToJson, 10000); // 10 seconds
  // Or for 24 hours: setInterval(fetchDataAndConvertToJson, 1000 * 60 * 60 * 24);
};

const app = express();
app.use(cors());

app.get("/getdata", (req, res) => {
  if (jsonData) {
    res.status(200).json({
      success: true,
      message: "data fetches successfully",
      data: JSON.parse(jsonData),
    });
  } else {
    res
      .status(503)
      .json({ success: false, message: "Data is not yet available" });
  }
});

app.listen(8000, () => {
  console.log("Server is running on port 8000");
  fetchDataAndConvertToJson();
});
