/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('permissions', {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true,
            unique: true
        },
        name: {
            type: DataTypes.TEXT,
            allowNull: false,
            unique: true
        },
        abbr: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        active: {
            type: DataTypes.BOOLEAN,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        created: {
            type: DataTypes.DATE,
            allowNull: false
        },
        updated_by: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        updated: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        tableName: 'permissions',
        timestamps: true,
        createdAt: 'created',
        updatedAt: 'updated',
        freezeTableName: true
    });
};
