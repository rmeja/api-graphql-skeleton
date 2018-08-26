'use strict';
/* eslint-disable no-unused-expressions */
const Promise = require('bluebird');
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

const context = { request };

const adminAccount = {
  uuid: faker.random.uuid(),
  login: 'johndoe',
  password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc',
  avatar: faker.system.filePath(),
  role: {
    uuid: faker.random.uuid(),
    name: 'administrator'
  }
};

describe('src/resolvers/account.js', function () {
  before(function () {
    this.timeout(100000);
    return models.sequelize.sync().then(() => {
      return models.account.create(adminAccount, { include: [models.role] });
    });
  });

  describe('Query', function () {
    it('accounts() should return all account', function () {
      expect(resolvers.Query.accounts).to.be.an('function');
      return resolvers.Query.accounts(null, null, context).then((accounts) => {
        expect(accounts).to.be.an('array');
        accounts.map(account => {
          expect(account).to.be.an('object');
          expect(account).to.have.property('uuid');
          expect(account).to.have.property('login');
          expect(account).to.have.property('password');
          expect(account).to.have.property('avatar');
        });
      });
    });

    it('accountById() should return an account', function () {
      expect(resolvers.Query.accountById).to.be.an('function');
      return resolvers.Query.accountById(
        null,
        { uuid: adminAccount.uuid },
        context
      ).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('uuid');
        expect(account).to.have.property('login');
        expect(account).to.have.property('password');
        expect(account).to.have.property('avatar');
      });
    });
  });

  describe('Account', function () {
    it('role() should return an role', function () {
      expect(resolvers.Account.role).to.be.an('function');
      return resolvers.Query.accountById(null, { uuid: adminAccount.uuid }, context).then(adminAccount => {
        return resolvers.Account.role(adminAccount, null, context);
      }).then(user => {
        expect(user).to.be.an('object');
      });
    });
  });

  describe('Mutation', function () {
    it('accountCreate() should create an account', function () {
      expect(resolvers.Mutation.accountCreate).to.be.an('function');
      return resolvers.Mutation.accountCreate(null, {
        input: {
          login: faker.internet.userName(),
          password: faker.internet.password(),
          avatar: faker.system.filePath()
        }
      }, context).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('uuid');
        expect(account).to.have.property('login');
        expect(account).to.have.property('password');
        expect(account).to.have.property('avatar');
      });
    });

    it('accountCreate() should create an account attached with a role', function () {
      expect(resolvers.Mutation.accountCreate).to.be.an('function');
      return resolvers.Mutation.accountCreate(null, {
        input: {
          login: faker.internet.userName(),
          password: faker.internet.password(),
          avatar: faker.system.filePath(),
          roleUuid: adminAccount.role.uuid
        }
      }, context).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('uuid');
        expect(account).to.have.property('login');
        expect(account).to.have.property('password');
        expect(account).to.have.property('avatar');
        expect(account).to.have.property('role');
        expect(account.role).to.be.an('object');
        expect(account.role).to.have.property('name');
      });
    });

    it('accountCreate() should return an error when no password', function () {
      expect(resolvers.Mutation.accountCreate).to.be.an('function');
      return resolvers.Mutation.accountCreate(null, {
        input: {
          login: faker.internet.userName(),
          avatar: faker.system.filePath()
        }
      }, context).catch((error) => {
        expect(error).to.be.an('error');
      });
    });

    it('accountUpdate() should update an account', function () {
      expect(resolvers.Mutation.accountUpdate).to.be.an('function');
      return resolvers.Mutation.accountUpdate(null, {
        uuid: adminAccount.uuid,
        input: {
          login: faker.internet.userName(),
          password: faker.internet.password(),
          avatar: faker.system.filePath()
        }
      }, context).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('uuid');
        expect(account).to.have.property('login');
        expect(account).to.have.property('password');
        expect(account).to.have.property('avatar');
      });
    });

    it('accountUpdate() should update an account attached with a role', function () {
      expect(resolvers.Mutation.accountUpdate).to.be.an('function');
      return resolvers.Mutation.accountUpdate(null, {
        uuid: adminAccount.uuid,
        input: {
          login: faker.internet.userName(),
          password: faker.internet.password(),
          avatar: faker.system.filePath(),
          roleUuid: adminAccount.role.uuid
        }
      }, context).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('uuid');
        expect(account).to.have.property('login');
        expect(account).to.have.property('password');
        expect(account).to.have.property('avatar');
        expect(account).to.have.property('role');
        expect(account.role).to.be.an('object');
        expect(account.role).to.have.property('name');
      });
    });

    it('accountDelete() should delete an account', function () {
      expect(resolvers.Mutation.accountDelete).to.be.an('function');
      return resolvers.Mutation.accountDelete(null, {
        uuid: adminAccount.uuid
      }, context).then(result => {
        expect(result).to.be.true;
      });
    });

    it('accountDelete() should throw an error with wrong uuid', async function () {
      expect(resolvers.Mutation.accountDelete).to.be.an('function');
      const error = await resolvers.Mutation.accountDelete(null, {
        uuid: 123456789
      }, context);
      expect(error).to.be.an.instanceof(Error);
      expect(error.message).to.equal('unknown uuid');
    });
  });

  after(function () {
    this.timeout(100000);
    sandbox.restore();
    return models.sequelize.drop();
  });
});
