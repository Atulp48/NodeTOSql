var sql = require("mssql/msnodesqlv8");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

let config = {
  connectionString: `Driver=SQL Server;
    Server=${process.env.WA_HOST_NAME}\\${process.env.WA_SERVER_NAME};
    Database=${process.env.WA_DATABASE_NAME};
    Trusted_Connection=true;`,
};

const fetchDataAndConvertToJson = () => {
  return new Promise((resolve, reject) => {
    sql.connect(config, (err) => {
      if (err) {
        console.error("Connection Failed:", err);
        return reject(err);
      }
      console.log("Database Connected");
      const request = new sql.Request();
      request.query(
        `SELECT TOP 2 * FROM ${process.env.WA_TABLE_NAME} ORDER BY ${process.env.WA_COLUMN_NAME} DESC`,
        (err, result) => {
          sql.close();
          if (err) {
            console.error("SQL Error:", err);
            return reject(err);
          }
          resolve(result.recordset);
        }
      );
    });
    sql.on("error", (err) => {
      console.error("SQL Connection Error:", err);
      reject(err);
    });
  });
};


fetchDataAndConvertToJson()
  .then((data) => console.log("Fetched Data:", data))
  .catch((err) => console.error("Error:", err));

fetchDataAndConvertToJson().then((data) => console.log(data)).catch((err) => console.log(err))

app.get("/getdata", async (req, res) => {
  const jsonData = await fetchDataAndConvertToJson()
  let val = Math.floor(Math.random() * 201);
  res.status(200).json({
    success: true,
    message: "data fetches successfully",
    data: {
      maindata: JSON.parse(jsonData),
      val: val,
    },
  });
});

app.listen( process.env.WA_PORT|| 9000, () => {
  console.log(`Server is running on port ${process.env.WA_PORT || 9000} `);
});
