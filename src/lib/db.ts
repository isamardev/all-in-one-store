import { Sequelize, DataTypes, Model } from 'sequelize';
import path from 'path';
import sqlite3 from 'sqlite3';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(process.cwd(), 'database.sqlite'),
  dialectModule: sqlite3,
  logging: console.log,
});

export default sequelize;

export class Product extends Model {
  declare id: number;
  declare name: string;
  declare code: string;
  declare costPrice: number;
  declare category: string;
  declare stock: number;
}

Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'General',
    },
    stock: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Product',
  }
);

export class Sale extends Model {
  declare id: number;
  declare productId: number;
  declare salePrice: number;
  declare costPrice: number;
  declare profit: number;
  declare date: Date;
}

Sale.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    profit: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Sale',
  }
);

export class Expense extends Model {
  declare id: number;
  declare description: string;
  declare amount: number;
  declare date: Date;
}

Expense.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Expense',
  }
);

export class Category extends Model {
  declare id: number;
  declare name: string;
}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
  }
);

// Define associations
Sale.belongsTo(Product, { foreignKey: 'productId' });
Product.hasMany(Sale, { foreignKey: 'productId' });

// Sync database only once
let isSynced = false;
export async function ensureDbSynced() {
  if (!isSynced) {
    try {
      await sequelize.sync({ alter: true });
      console.log('Database synced with alter: true');
    } catch (e) {
      console.log('Alter failed, normal sync');
      await sequelize.sync();
    }
    isSynced = true;
  }
}
