'use strict';
/* eslint-disable no-unused-expressions */
const expect = require('chai').expect;
const faker = require('faker');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const resolvers = require('../../src/resolvers');
const models = require('./../../src/models');
const request = {
  user: models.account.build({
    uuid: faker.random.uuid()
  })
};
sandbox.stub(request.user, 'hasPermissionTo').returns(Promise.resolve(true));

const context = { models, request };

const nameModels = ['account', 'role', 'permission', 'organization', 'person', 'postalAddress', 'building', 'level'];
const actions = ['create', 'read', 'update', 'delete'];

const permissions = nameModels.map(nameModel => {
  return actions.map(action => {
    return {
      uuid: faker.random.uuid(),
      name: `${nameModel}:${action}`,
      description: `can ${action} ${nameModel}`
    };
  });
}).reduce((a, b) => a.concat(b), []);

describe('src/resolvers/permission.js', function () {
  before(function () {
    this.timeout(100000);
    return models.sequelize.sync().then(() => {
      return models.permission.bulkCreate(permissions);
    });
  });

  describe('Query', function () {
    it('roles() should return all permissions', function () {
      expect(resolvers.Query.permissions).to.be.an('function');
      return resolvers.Query.permissions(null, null, context).then((permissions) => {
        expect(permissions).to.be.an('array');
        permissions.map(permission => {
          expect(permission).to.be.an('object');
          expect(permission).to.have.property('uuid');
          expect(permission).to.have.property('name');
          expect(permission).to.have.property('description');
        });
      });
    });

    it('role() should return an permission', function () {
      expect(resolvers.Query.permissionById).to.be.an('function');
      return resolvers.Query.permissionById(null, { uuid: permissions[0].uuid }, context).then((permission) => {
        expect(permission).to.be.an('object');
        expect(permission).to.have.property('uuid');
        expect(permission).to.have.property('name');
        expect(permission).to.have.property('description');
      });
    });
  });

  after(function () {
    this.timeout(100000);
    sandbox.restore();
    return models.sequelize.drop();
  });
});
