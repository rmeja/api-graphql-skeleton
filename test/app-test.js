const request = require('supertest');
const expect = require('chai').expect;
const faker = require('faker');
const sinon = require('sinon');
const sandbox = sinon.createSandbox();
const models = require('../src/models');
const Model = require('sequelize').Model;
const app = require('../src/app.js');

describe('app.js', function () {
  describe('/login', function () {
    before(function () {
      sandbox.stub(Model, 'findOne').callsFake(({ where: { login } }) => {
        const account = models.account.build({
          uuid: faker.random.uuid(),
          login,
          password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc'
        });
        return login === 'john@doe.fr' ? Promise.resolve(account) : Promise.reject(new Error("can't find account"));
      });
    });

    it('should authentificate an account', function () {
      return request(app)
        .post('/login')
        .type('form')
        .send({
          login: 'john@doe.fr',
          password: '123456'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .then(response => {
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('ok');
          expect(response.body).to.have.property('token');
          expect(response.body.token).to.be.a('string');
        });
    });

    it('should return a code 401 (unauthorized) with an wrong email', function () {
      return request(app)
        .post('/login')
        .type('form')
        .send({
          login: 'robert@doe.fr',
          password: '123456'
        })
        .set('Accept', 'application/json')
        .expect(401)
        .then(response => {
          expect(response.body).to.be.an('object');
        });
    });

    it('should return a code 401 (unauthorized) with an wrong passphrase', function () {
      return request(app)
        .post('/login')
        .type('form')
        .send({
          login: 'john@doe.fr',
          password: '123987'
        })
        .set('Accept', 'application/json')
        .expect(401)
        .then(response => {
          expect(response.body).to.be.an('object');
        });
    });

    after(function () {
      sandbox.restore();
    });
  });

  describe('/refresh', function () {
    before(function () {
      sandbox.stub(Model, 'findOne').callsFake((options) => {
        const uuid = options.where.uuid;
        const login = options.where.login;
        const account = models.account.build({
          uuid: 'f4dffffa-8129-423d-b624-394c673f7fbe',
          login: 'john@doe.fr',
          password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc'
        });
        return uuid === 'f4dffffa-8129-423d-b624-394c673f7fbe' || login === 'john@doe.fr' ? Promise.resolve(account) : Promise.reject(new Error("can't find account"));
      });
    });

    it('should return a new token JWT from a valid token JWT', function () {
      return request(app)
        .post('/login')
        .type('form')
        .send({
          login: 'john@doe.fr',
          password: '123456'
        })
        .set('Accept', 'application/json')
        .expect(200)
        .then((response) => {
          return request(app)
            .post('/refresh')
            .set('Authorization', 'bearer ' + response.body.token)
            .set('Accept', 'application/json')
            .expect(200);
        })
        .then((response) => {
          expect(response.body).to.be.an('object');
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.equal('ok');
          expect(response.body).to.have.property('token');
          expect(response.body.token).to.be.a('string');
        });
    });

    it('should return a code 401 (unauthorized) with a bad token JWT', function () {
      return request(app)
        .post('/refresh')
        .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o')
        .set('Accept', 'application/json')
        .expect(401)
        .then((response) => {
          expect(response.body).to.be.an('object');
        });
    });

    after(function () {
      sandbox.restore();
    });
  });
});
