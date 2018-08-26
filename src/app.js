require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const compression = require('compression');
const models = require('./models');
const argon2 = require('argon2');
const passport = require('passport');
const passportJWT = require('passport-jwt');
const jwt = require('jsonwebtoken');
const { graphqlExpress, graphiqlExpress } = require('apollo-server-express');
const { makeExecutableSchema } = require('graphql-tools');

const ExtractJwt = passportJWT.ExtractJwt;
const jwtOptions = {
  algorithms: ['HS256'],
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: 'ThisIsVeryImportantToChangeMeBeforeProductionStaging'
};

const JwtStrategy = passportJWT.Strategy;
passport.use(new JwtStrategy(
  jwtOptions,
  function (jwtPayload, done) {
    models.account.findOne({ where: { uuid: jwtPayload.uuid } }).then((account) => {
      done(null, account);
    }).catch(() => {
      done(null, false);
    });
  })
);

const LocalStrategy = require('passport-local').Strategy;
passport.use(new LocalStrategy(
  {
    usernameField: 'login',
    passwordField: 'password',
    session: false
  },
  function (login, password, done) {
    models.account.findOne({ where: { login } }).then((account) => {
      argon2.verify(account.password, password).then(match => {
        if (!match) return done(null, false);
        return done(null, account);
      }).catch((error) => done(error));
    }).catch(() => {
      done(null, false);
    });
  }
));

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(compression());
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));

const typeDefs = require('./schemas');
const resolvers = require('./resolvers');
const { customFieldResolver } = require('./utils');
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(
  '/graphql',
  passport.authenticate('jwt', { session: false }),
  graphqlExpress(request => {
    return {
      schema,
      context: { request },
      fieldResolver: customFieldResolver
    };
  })
);

const env = process.env.NODE_ENV || 'production';
if (env === 'development') {
  app.use(
    '/graphql-test',
    graphqlExpress(request => {
      return {
        schema,
        context: { request },
        fieldResolver: customFieldResolver
      };
    })
  );

  app.use(
    '/graphiql',
    graphiqlExpress({
      endpointURL: '/graphql-test'
    })
  );
}

app.post('/login',
  passport.authenticate('local', { session: false }),
  function (req, res) {
    const payload = {
      uuid: req.user.uuid
    };
    const token = jwt.sign(
      payload,
      jwtOptions.secretOrKey,
      { expiresIn: '2h' }
    );
    res.json({ message: 'ok', token });
  }
);

app.post('/refresh',
  passport.authenticate('jwt', { session: false }),
  function (req, res) {
    const payload = {
      uuid: req.user.uuid
    };
    const token = jwt.sign(
      payload,
      jwtOptions.secretOrKey,
      { expiresIn: '2h' }
    );
    res.json({ message: 'ok', token });
  }
);

module.exports = app;
