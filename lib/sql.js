/* DB interface
 *
 * SOL
 * 20161223
 */

var wrapper = require("co-mysql");
var mysql = require("mysql");

var option = 
{
    host: 'localhost',
    port: 3306,
    database: 'library',
    user: 'access',
    password: '',
}

var pool = mysql.createPool(option);
var p = wrapper(pool);

console.log('[INFO] MySQL Connector ready.');

async function execute(sql, args)
{
    return await p.query(mysql.format(sql, args));
}

exports.sql = execute;