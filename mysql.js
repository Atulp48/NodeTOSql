const mysql = require("mysql2/promise");
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());

const dbConfig = {
    host: process.env.MYSQL_HOST_NAME,
    user: process.env.MYSQL_USER_NAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE_NAME,
};

const table = process.env.MYSQL_TABLE_NAME;


const fetchDataAndConvertToJson = async () => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        // const [rows] = await connection.execute(`SELECT * FROM ${table}`);
        const [rows] = await connection.execute(`SELECT * FROM ${table} LIMIT 2`);
        console.log(rows)
        return rows
        await connection.end();
    } catch (error) {
        console.error("Error fetching data:", error);
    }
};

app.get("/getdata", async (req, res) => {
    const jsonData = await fetchDataAndConvertToJson()
    res.status(200).json({
        success: true,
        message: "data fetches successfully",
        data: jsonData,
    });
});
app.listen(process.env.MYSQL_PORT_NAME || 9000, () => {
    console.log(`Server is running on port ${process.env.MYSQL_PORT_NAME || 9000}`);
});