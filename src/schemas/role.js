module.exports = () => [role, permission, base];

const permission = require('./permission');
const base = require('./base');

const role = `
type Role {
    uuid: ID!
    name: String
    permissions: [Permission]
}

input InputRole {
    name: String
    permissionUuids: [ID]
}

extend type Query {
    roleById(uuid: ID!): Role
    roles: [Role]
}

extend type Mutation {
    roleCreate(input: InputRole!): Role
    roleUpdate(uuid: ID!, input: InputRole!): Role
    roleDelete(uuid: ID!): Boolean
}
`;
