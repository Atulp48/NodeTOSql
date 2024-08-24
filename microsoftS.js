const sql = require("mssql");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const dbConfig = {
  user: process.env.USER_NAME,
  password: process.env.PASSWORD,
  server: process.env.SERVER_NAME,
  database: process.env.DATABASE_NAME,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: process.env.INSTANCE_NAME,
  },
  // the port is optional there is no need to specify the port so  not uncomment the below line the code is working well without port
  // port: 1433,
};

let jsonData = null;
const column = process.env.COLUMN_NAME;

const fetchDataAndConvertToJson = async () => {
  try {
    const pool = await sql.connect(dbConfig);

    // const result = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
    const result = await pool
      .request()
      .query(`SELECT TOP 2 * FROM ${process.env.TABLE_NAME}`);
    // const result = await pool.request().query(`SELECT TOP 20 * FROM ${table} ORDER BY ${column} DESC`);

    jsonData = JSON.stringify(result.recordset, null, 2);
    console.log("Data fetched Successfully.");
    // console.log(jsonData);
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

app.listen(process.env.PORT_NAME || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT_NAME || 9000}`);
  fetchDataAndConvertToJson();
});
