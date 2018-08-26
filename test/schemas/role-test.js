const { makeExecutableSchema, mockServer } = require('graphql-tools');
const chai = require('chai');
chai.use(require('chai-uuid'));
const expect = chai.expect;

const userTypeDefs = require('./../../src/schemas/role.js');
const schema = makeExecutableSchema({ typeDefs: [userTypeDefs] });
const myMockServer = mockServer(schema);

describe('src/schemas/role.js', function () {
  it('should return all roles', function () {
    return myMockServer.query(`{
      roles {
        uuid
        name
      }
    }`).then((result) => {
      expect(result).to.be.an('object');
      expect(result).to.have.property('data');
      expect(result).to.have.nested.property('data.roles');
      expect(result.data.roles).to.be.an('array');
      result.data.roles.map(role => {
        expect(role).to.be.an('object');
        expect(role.uuid).to.be.uuid('v4');
        expect(role.name).to.be.a('string');
      });
    });
  });
  it('should return all roles with all permissions', function () {
    return myMockServer.query(`{
      roles {
        uuid
        name
        permissions {
          uuid
          name
        }
      }
    }`).then((result) => {
      expect(result).to.be.an('object');
      expect(result).to.have.property('data');
      expect(result).to.have.nested.property('data.roles');
      expect(result.data.roles).to.be.an('array');
      result.data.roles.map(role => {
        expect(role).to.be.an('object');
        expect(role.uuid).to.be.uuid('v4');
        expect(role.name).to.be.a('string');
        expect(role).to.have.property('permissions');
        expect(role.permissions).to.be.an('array');
      });
    });
  });
});
