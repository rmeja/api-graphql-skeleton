'use strict';
module.exports = (sequelize, DataTypes) => {
  const permission = sequelize.define('permission', {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      unique: true
    },
    description: DataTypes.STRING,
    // Timestamps for migrations
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  }, {});
  permission.associate = function (models) {
    this.belongsToMany(models.role, {
      through: 'role_permission'
    });
  };
  return permission;
};
