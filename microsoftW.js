var sql = require("mssql/msnodesqlv8");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

let config = {
  connectionString: `Driver=SQL Server;
    Server=${process.env.HOST_NAME}\\${process.env.SERVER_NAME};
    Database=${process.env.DATABASE_NAME};
    Trusted_Connection=true;`,
};

let jsonData = null;

const fetchDataAndConvertToJson = () => {
  sql.connect(config, (err) => {
    new sql.Request().query(
      `SELECT TOP 20 * FROM ${process.env.TABLE_NAME} ORDER BY ${process.env.COLUMN_NAME} DESC`,
      (err, result) => {
        console.log("Database Connected");
        if (err) {
          console.log("SQL error but connection OK");
        } else {
          // console.log(result.recordset);
          jsonData = JSON.stringify(result.recordset, null, 2);
          // console.log("my json data ",jsonData);
        }
      }
    );
  });

  sql.on("error", (err) => {
    console.log("Connection Failed");
  });
};

const startAutoFetch = () => {
  fetchDataAndConvertToJson();
  // setInterval(fetchDataAndConvertToJson, 10000); // 10 seconds
  setInterval(fetchDataAndConvertToJson, 1000 * 60 * 60 * 24);
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
      .json({ success: false, message: "Data is not yet available" });
  }
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on port ${process.env.PORT || 9000} `);
  fetchDataAndConvertToJson();
  // startAutoFetch()
});
