/** Database setup for BizTime. */

const { Client } = require("pg");

const client = new Client({
    user: 'baer',
    host: 'localhost',
    port: 5432,
    password: 'baer',
    database: 'biztime'
  });
  
  client.connect();
  
  module.exports = client;

  