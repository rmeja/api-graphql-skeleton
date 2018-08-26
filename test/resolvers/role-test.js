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

const adminRole = {
  uuid: faker.random.uuid(),
  name: 'administrator',
  permissions
};

describe('src/resolvers/role.js', function () {
  before(function () {
    this.timeout(100000);
    return models.sequelize.sync().then(() => {
      return models.role.create(adminRole, {
        include: [models.permission]
      });
    });
  });

  describe('Query', function () {
    it('roles() should return all roles', function () {
      expect(resolvers.Query.roles).to.be.an('function');
      return resolvers.Query.roles(null, null, context).then((roles) => {
        expect(roles).to.be.an('array');
        roles.map(role => {
          expect(role).to.be.an('object');
          expect(role).to.have.property('uuid');
          expect(role).to.have.property('name');
        });
      });
    });

    it('role() should return an role', function () {
      expect(resolvers.Query.roleById).to.be.an('function');
      return resolvers.Query.roleById(null, { uuid: adminRole.uuid }, context).then((role) => {
        expect(role).to.be.an('object');
        expect(role).to.have.property('uuid');
        expect(role).to.have.property('name');
      });
    });
  });

  describe('Mutation', function () {
    it('roleCreate() should create a role', function () {
      expect(resolvers.Mutation.roleCreate).to.be.an('function');
      return resolvers.Mutation.roleCreate(null, {
        input: {
          name: 'technician'
        }
      }, context).then((role) => {
        expect(role).to.be.an('object');
        expect(role).to.have.property('uuid');
        expect(role).to.have.property('name');
        expect(role.name).to.equal('technician');
      });
    });

    it('roleCreate() should create a role with permissions', function () {
      expect(resolvers.Mutation.roleCreate).to.be.an('function');
      return resolvers.Mutation.roleCreate(null, {
        input: {
          name: 'technician',
          permissionUuids: permissions.map(permission => permission.uuid)
        }
      }, context).then((role) => {
        expect(role).to.be.an('object');
        expect(role).to.have.property('uuid');
        expect(role).to.have.property('name');
        expect(role.name).to.equal('technician');
        expect(role).to.have.property('permissions');
        expect(role.permissions).to.be.an('array');
        expect(role.permissions).to.have.lengthOf(32);
      });
    });

    it('roleUpdate() should update an role', function () {
      expect(resolvers.Mutation.roleUpdate).to.be.an('function');
      return resolvers.Mutation.roleUpdate(null, {
        uuid: adminRole.uuid,
        input: {
          name: 'director'
        }
      }, context).then((role) => {
        expect(role).to.be.an('object');
        expect(role).to.have.property('uuid');
        expect(role).to.have.property('name');
        expect(role.name).to.equal('director');
      });
    });

    it('roleUpdate() should update an role with permissions', function () {
      expect(resolvers.Mutation.roleUpdate).to.be.an('function');
      return resolvers.Mutation.roleUpdate(null, {
        uuid: adminRole.uuid,
        input: {
          name: 'president',
          permissionUuids: permissions.map(permission => permission.uuid).slice(0, 10)
        }
      }, context).then((role) => {
        expect(role).to.be.an('object');
        expect(role).to.have.property('uuid');
        expect(role).to.have.property('name');
        expect(role.name).to.equal('president');
        expect(role).to.have.property('permissions');
        expect(role.permissions).to.be.an('array');
        expect(role.permissions).to.have.lengthOf(10);
      });
    });

    it('roleUpdate() should throw an error with wrong uuid', function () {
      expect(resolvers.Mutation.roleUpdate).to.be.an('function');
      return resolvers.Mutation.roleUpdate(null, {
        uuid: 123456789,
        input: {
          name: 'éplucheur de patate'
        }
      }, context).catch((error) => {
        expect(error).to.be.an.instanceof(Error);
      });
    });

    it('roleDelete() should delete a role', function () {
      expect(resolvers.Mutation.roleDelete).to.be.an('function');
      return resolvers.Mutation.roleDelete(null, {
        uuid: adminRole.uuid
      }, context);
    });
  });

  after(function () {
    this.timeout(100000);
    sandbox.restore();
    return models.sequelize.drop();
  });
});
