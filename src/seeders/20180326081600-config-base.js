'use strict';
const Promise = require('bluebird');
const models = require('../models');

const admin = {
  login: 'johndoe',
  password: '$argon2i$v=19$m=4096,t=3,p=1$CxnnerAwIpnDdqI6bAjG9w$keNau2CHhpwjs54E3fxu6t5jR0DwMeHTw4SY/Em0hWc' // 123456
};

const nameModels = [
  { en: 'account', fr: 'un compte' },
  { en: 'role', fr: 'un role' },
  { en: 'permission', fr: 'une permission' }
];

const actions = [
  { en: 'create', fr: 'créer' },
  { en: 'read', fr: 'lire' },
  { en: 'update', fr: 'modifier' },
  { en: 'delete', fr: 'supprimer' }
];

const allPermissions = nameModels.map(nameModel => {
  return actions.map(action => {
    return {
      name: `${nameModel.en}:${action.en}`,
      description: `permet de ${action.fr} ${nameModel.fr}`
    };
  });
}).reduce((a, b) => a.concat(b), []);

const adminRole = {
  name: 'administrator',
  permissions: allPermissions
};

module.exports = {
  up: () => {
    return models.sequelize.sync().then(() => {
      return Promise.join(
        models.role.create(adminRole, { include: [models.permission] }),
        models.account.create(admin),
        (role, admin) => admin.setRole(role)
      );
    });
  },
  down: () => {
    return Promise.resolve().then(() => {
      return models.sequelize.drop();
    });
  }
};
