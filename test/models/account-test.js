'use strict';
/* eslint-disable no-unused-expressions */
const Promise = require('bluebird');
const expect = require('chai').expect;
const models = require('./../../src/models');
const now = Date.now();
let uuidFakerAccount;

describe('src/models/account.js', function () {
  this.timeout(5000);

  before(function () {
    const fakeAccount = {
      login: 'john@doe.fr',
      password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc',
      avatar: '/path/to/my/avatar.png',
      createdAt: now,
      updatedAt: now
    };

    const fakeRole = {
      name: 'administrator',
      createdAt: now,
      updatedAt: now
    };

    const fakePermission = {
      name: 'read account',
      createdAt: now,
      updatedAt: now
    };

    return models.sequelize.sync().then(() => {
      return Promise.join(
        models.account.create(fakeAccount),
        models.role.create(fakeRole),
        models.permission.create(fakePermission),
        function (account, role, permission) {
          uuidFakerAccount = account.uuid;
          return role.addPermission(permission).then(() => account.setRole(role));
        }
      );
    });
  });

  it('should create a new account', function () {
    const fakeAccount = {
      login: 'jane@doe.fr',
      password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc',
      avatar: '/path/to/my/avotor.png',
      createdAt: now,
      updatedAt: now
    };
    return models.account.create(fakeAccount).then((account) => {
      expect(account).to.be.an('object');
      expect(account).to.have.property('dataValues');
      expect(account.dataValues).to.have.all.keys(
        'uuid',
        'login',
        'password',
        'avatar',
        'createdAt',
        'updatedAt'
      );
    });
  });

  it('should find all users', function () {
    return models.account.findAll().then(users => {
      expect(users).to.be.an('array');
      users.map(account => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('dataValues');
        expect(account.dataValues).to.have.all.keys(
          'uuid',
          'login',
          'password',
          'avatar',
          'createdAt',
          'updatedAt',
          'roleUuid'
        );
      });
    });
  });

  it('should find an account whith his uuid', function () {
    return models.account.findById(uuidFakerAccount).then((account) => {
      expect(account).to.be.an('object');
      expect(account).to.have.property('dataValues');
      expect(account.dataValues).to.have.all.keys(
        'uuid',
        'login',
        'password',
        'avatar',
        'createdAt',
        'updatedAt',
        'roleUuid'
      );
    });
  });

  it('should update an account', function () {
    return models.account.find({ where: { login: 'john@doe.fr' } }).then((account) => {
      account.name = 'Dodoe';
      return account.update(account).then((account) => {
        expect(account).to.be.an('object');
        expect(account).to.have.property('dataValues');
        expect(account.dataValues).to.have.all.keys(
          'uuid',
          'login',
          'password',
          'avatar',
          'createdAt',
          'updatedAt',
          'roleUuid'
        );
        expect(account.name).to.equal('Dodoe');
      });
    });
  });

  it('should check permission', function () {
    return models.account.find({ where: { login: 'john@doe.fr' } }).then(account => {
      expect(account.hasPermissionTo).to.be.a('function');
      return account.hasPermissionTo('read account').then(canReadAccount => {
        expect(canReadAccount).to.be.a('boolean');
        expect(canReadAccount).to.be.true;
        return account.hasPermissionTo('create account');
      }).then(canCreateAccount => {
        expect(canCreateAccount).to.be.a('boolean');
        expect(canCreateAccount).to.be.false;
      });
    });
  });

  it('should return an error when account doesn\'t have permission', function () {
    const fakeAccountWithoutPermission = {
      firstName: 'John',
      name: 'WithoutPermission',
      login: 'without-permission@doe.fr',
      password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc',
      avatar: '/path/to/my/avatar.png',
      createdAt: now,
      updatedAt: now
    };

    const fakeRole = {
      name: 'technician',
      createdAt: now,
      updatedAt: now
    };

    return Promise.join(
      models.account.create(fakeAccountWithoutPermission),
      models.role.create(fakeRole),
      function (account, role) {
        return account.setRole(role);
      }
    ).then((account) => {
      return account.hasPermissionTo('read account').catch((error) => {
        expect(error).to.be.an.instanceof(Error);
      });
    });
  });

  it('should return an error when account doesn\'t have role', function () {
    const fakeAccountWithoutRole = {
      firstName: 'John',
      name: 'WithoutRole',
      login: 'without-role@doe.fr',
      password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc',
      avatar: '/path/to/my/avatar.png',
      createdAt: now,
      updatedAt: now
    };

    return models.account.create(fakeAccountWithoutRole).then((account) => {
      return account.hasPermissionTo('read account').catch((error) => {
        expect(error).to.be.an.instanceof(Error);
      });
    });
  });

  after(function () {
    return models.sequelize.drop();
  });
});
