const Promise = require('bluebird');
const argon2 = require('argon2');
const { combineResolvers } = require('graphql-resolvers');
const { can } = require('./helpers');
const models = require('../models');

const resolvers = {
  Query: {
    accountById: combineResolvers(
      can('account:read'),
      (_, { uuid }) => models.account.findByPk(uuid)
    ),
    accounts: combineResolvers(
      can('account:read'),
      () => models.account.findAll()
    )
  },
  Mutation: {
    accountCreate: combineResolvers(
      can('account:create'),
      (_, { input }) => {
        return Promise.resolve(input).then(input => {
          if (!input.password) return Promise.reject(new Error('missing password'));
          return argon2.hash(input.password).then(hash => {
            input.password = hash;
            return input;
          });
        }).then(input => {
          return models.account.create(input).then((account) => ({ input, account }));
        }).then(({ input, account }) => {
          if (!input.roleUuid) return account;
          return models.role.findByPk(input.roleUuid)
            .then(role => account.setRole(role))
            .then(() => account);
        }).then(account => {
          return models.account.findByPk(account.uuid, {
            include: [models.role]
          });
        });
      }
    ),
    accountUpdate: combineResolvers(
      can('account:update'),
      (_, { uuid, input }) => {
        return models.account.findByPk(uuid, {
          include: [models.role]
        }).then(account => {
          if (!input.password) return { input, account };
          return argon2.hash(input.password).then(hash => {
            input.password = hash;
            return { input, account };
          });
        }).then(({ input, account }) => {
          return account.update(input).then((account) => ({ input, account }));
        }).then(({ input, account }) => {
          if (!input.roleUuid) return account;
          return models.role.findByPk(input.roleUuid)
            .then(role => account.setRole(role))
            .then(() => account);
        }).then(account => {
          return models.account.findByPk(account.uuid, {
            include: [models.role]
          });
        });
      }
    ),
    accountDelete: combineResolvers(
      can('account:delete'),
      (_, { uuid }) => {
        return models.account.findByPk(uuid, {
          include: [models.role]
        }).then(account => {
          if (!account) return Promise.reject(new Error('unknown uuid'));
          return account.destroy().then(() => true);
        });
      }
    )
  },
  Account: {
    role: combineResolvers(
      can('role:read'),
      (account) => account.getRole()
    )
  }
};

module.exports = resolvers;
