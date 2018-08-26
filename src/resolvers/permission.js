const { combineResolvers } = require('graphql-resolvers');
const { can } = require('./helpers');
const models = require('../models');

const resolvers = {
  Query: {
    permissionById: combineResolvers(
      can('permission:read'),
      (_, { uuid }) => models.permission.findById(uuid)
    ),
    permissions: combineResolvers(
      can('permission:read'),
      () => models.permission.findAll()
    )
  }
};

module.exports = resolvers;
