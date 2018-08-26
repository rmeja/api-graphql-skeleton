'use strict';
module.exports = (sequelize, DataTypes) => {
  const role = sequelize.define('role', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: DataTypes.STRING,
    // Timestamps for migrations
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, { freezeTableName: true });
  role.associate = function (models) {
    this.hasMany(models.account);
    this.belongsToMany(models.permission, {
      through: 'role_permission'
    });
  };
  return role;
};
