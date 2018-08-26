'use strict';
module.exports = (sequelize, DataTypes) => {
  const account = sequelize.define('account', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    login: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING,
    avatar: DataTypes.STRING,
    // Timestamps for migrations
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, { freezeTableName: true });
  account.associate = function (models) {
    this.belongsTo(models.role);
  };

  account.prototype.hasPermissionTo = function (permissionToCheck) {
    return Promise.resolve().then(() => {
      if (this.hasOwnProperty('permissions')) return this.permissions;
      return this.getRole().then((role) => {
        if (!role) return Promise.reject(new Error('account doesn\'t have role'));
        return role.getPermissions().then(permissions => {
          this.permissions = permissions;
          return permissions;
        });
      });
    }).then((permissions) => {
      if (permissions.length === 0) return Promise.reject(new Error('role doesn\'t have permissions'));
      return permissions.filter(permission => {
        return permission.name === permissionToCheck;
      }).length >= 1;
    });
  };

  return account;
};
