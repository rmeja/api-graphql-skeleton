const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);

const typeDefs = fs.readdirSync(__dirname)
  .filter(file => (file !== basename) && (path.extname(file) === '.js'))
  .map(file => require(path.join(__dirname, file)));

module.exports = typeDefs;
