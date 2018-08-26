module.exports = () => [permission, base];

const base = require('./base');

const permission = `
type Permission {
    uuid: ID!
    name: String
    description: String
}

extend type Query {
    permissionById(uuid: ID!): Permission
    permissions: [Permission]
}
`;
