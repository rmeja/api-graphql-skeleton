const fs = require('fs');
const path = require('path');
const basename = path.basename(__filename);
const { merge } = require('lodash');
const { GraphQLDate, GraphQLTime, GraphQLDateTime } = require('graphql-iso-date');

const resolvers = fs.readdirSync(__dirname)
  .filter(file => (file !== basename) && (file !== 'helpers.js') && (path.extname(file) === '.js'))
  .map(file => require(path.join(__dirname, file)));

resolvers.push({ GraphQLDate, GraphQLTime, GraphQLDateTime });
module.exports = merge(...resolvers);
