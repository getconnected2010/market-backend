const mysql = require('mysql')
require('dotenv').config()

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MYSQL_DB_HOST,
    user: process.env.MYSQL_DB_USER,
    password: process.env.MYSQL_DB_PASSWORD,
    database: process.env.MYSQL_DB_DATABASE
})

pool.getConnection((err, connection)=>{
    if(err){
        console.log('error connecting to db')
    }else{
        console.log('connected to db')
    }
})

module.exports = pool