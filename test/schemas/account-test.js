const { makeExecutableSchema, mockServer } = require('graphql-tools');
const chai = require('chai');
chai.use(require('chai-uuid'));
const expect = chai.expect;

const userTypeDefs = require('./../../src/schemas/account.js');
const schema = makeExecutableSchema({
  typeDefs: [userTypeDefs],
  resolverValidationOptions: {
    requireResolversForResolveType: false
  }
});
const myMockServer = mockServer(schema);

describe('src/schemas/account.js', function () {
  it('should return all account', function () {
    return myMockServer.query(`{
      accounts {
        uuid
        login
        password
        avatar
        role {
          uuid
          name
        }
      }
    }`).then((result) => {
      expect(result).to.be.an('object');
      expect(result).to.have.property('data');
      expect(result).to.have.nested.property('data.accounts');
      expect(result.data.accounts).to.be.an('array');
      result.data.accounts.map(account => {
        expect(account).to.have.all.keys(
          'uuid',
          'login',
          'password',
          'avatar',
          'role'
        );
        expect(account).to.be.an('object');
        expect(account.uuid).to.be.uuid('v4');
        expect(account.login).to.be.a('string');
        expect(account.password).to.be.a('string');
        expect(account.avatar).to.be.a('string');
        expect(account.role).to.be.an('object');
      });
    });
  });

  it('should return an account', function () {
    return myMockServer.query(`{
      accountById(uuid:"1") {
        uuid
        login
        password
        avatar
        role {
          uuid
          name
        }
      }
    }`).then((result) => {
      expect(result).to.be.an('object');
      expect(result).to.have.property('data');
      expect(result).to.have.nested.property('data.accountById');
      expect(result.data.accountById).to.be.an('object');
      const account = result.data.accountById;
      expect(account).to.have.all.keys(
        'uuid',
        'login',
        'password',
        'avatar',
        'role'
      );
      expect(account).to.be.an('object');
      expect(account.uuid).to.be.uuid('v4');
      expect(account.login).to.be.a('string');
      expect(account.password).to.be.a('string');
      expect(account.avatar).to.be.a('string');
      expect(account.role).to.be.an('object');
    });
  });
});
