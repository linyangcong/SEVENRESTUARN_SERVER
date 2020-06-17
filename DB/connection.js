// import {mysqlServer} from '../config'
var mysql = require("mysql")
var {mysql_config}=require('../config')
var pool = mysql.createPool({
    host     : mysql_config.host,
    user     : mysql_config.passname,
    password : mysql_config.password,
    database : mysql_config.database
})
function conn(sql,callback){
    pool.getConnection(function(err,connection){
        connection.query(sql, function (err,rows) {
            callback(err,rows)
            connection.release()
        })
    })
}//对数据库进行增删改查操作的基础
exports.conn=conn;