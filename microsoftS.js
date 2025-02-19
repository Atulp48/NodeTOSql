const sql = require("mssql");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const dbConfig = {
  user: process.env.SQL_USER_NAME,
  password: process.env.SQL_PASSWORD,
  server: process.env.SQL_SERVER_NAME,
  database: process.env.SQL_DATABASE_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    trustedConnection: false,
    enableArithAbort: true,
    instancename: process.env.SQL_INSTANCE_NAME,
  },
  port: 1433,
};

const fetchDataAndConvertToJson = async () => {
  const pool = await sql.connect(dbConfig);
  try {
    const result = await pool
      .request()
      .query(`SELECT TOP 20 * FROM ${process.env.SQL_TABLE_NAME}`);

    console.log("Data fetched Successfully.");
    return result.recordset;
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    if (pool) await pool.close();
  }
};


fetchDataAndConvertToJson().then((data) => console.log(data)).catch((error) => console.log(error))

app.get("/getdata", async (req, res) => {
  const jsonData = await fetchDataAndConvertToJson()
  res.status(200).json({
    success: true,
    message: "data fetches successfully",
    data: JSON.parse(jsonData),
  });
}
);

app.listen(process.env.SQL_PORT_NAME || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT_NAME || 9000}`);
});
