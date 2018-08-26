const { combineResolvers } = require('graphql-resolvers');
const { can } = require('./helpers');
const models = require('../models');

const resolvers = {
  Query: {
    roleById: combineResolvers(
      can('role:read'),
      (_, { uuid }) => models.role.findById(uuid)
    ),
    roles: combineResolvers(
      can('role:read'),
      () => models.role.findAll()
    )
  },
  Mutation: {
    roleCreate: combineResolvers(
      can('role:create'),
      (_, { input }) => {
        return models.role.create(input).then(role => {
          if (!input.permissionUuids) return role;
          const Op = models.Sequelize.Op;
          return models.permission.findAll({
            where: {
              [Op.or]: input.permissionUuids.map(permissionUuid => ({ uuid: permissionUuid }))
            }
          }).then(permissions => {
            return role.setPermissions(permissions);
          }).then(() => models.role.findById(role.uuid, {
            include: [models.permission]
          }));
        });
      }
    ),
    roleUpdate: combineResolvers(
      can('role:update'),
      (_, { uuid, input }) => {
        return models.role.findById(uuid).then((role) => {
          return role.update(input);
        }).then(role => {
          if (!input.permissionUuids) return role;
          const Op = models.Sequelize.Op;
          return models.permission.findAll({
            where: {
              [Op.or]: input.permissionUuids.map(permissionUuid => ({ uuid: permissionUuid }))
            }
          }).then(permissions => {
            return role.setPermissions(permissions);
          }).then(() => models.role.findById(role.uuid, {
            include: [models.permission]
          }));
        });
      }
    ),
    roleDelete: combineResolvers(
      can('role:delete'),
      (_, { uuid }) => {
        return models.role.findById(uuid).then((role) => {
          if (!role) return Promise.reject(new Error('unknown uuid'));
          return role.destroy();
        });
      }
    )
  },
  Role: {
    permissions: combineResolvers(
      can('permission:read'),
      (role) => role.getPermissions()
    )
  }
};

module.exports = resolvers;
