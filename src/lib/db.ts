import { Sequelize, DataTypes, Model } from 'sequelize';
import pg from 'pg';

const sequelize = new Sequelize('postgresql://neondb_owner:npg_wM7k4yolpxOL@ep-holy-hat-ao3titjr-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require', {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: false, // Set to console.log if you want to see SQL queries
});

export default sequelize;

export class Product extends Model {
  declare id: number;
  declare name: string;
  declare code: string;
  declare costPrice: number;
  declare category: string;
  declare stock: number;
  declare salePrice: number;
  declare compareAtPrice: number;
  declare description: string | null;
  declare sku: string | null;
  declare images: string | null;
  declare status: string;
  declare image: string | null;
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
    salePrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    compareAtPrice: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    sku: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    images: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      defaultValue: 'active',
    },
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    indexes: [
      {
        unique: false,
        fields: ['code']
      }
    ]
  }
);

export class Sale extends Model {
  declare id: number;
  declare productId: number;
  declare quantity: number;
  declare salePrice: number;
  declare costPrice: number;
  declare discount: number;
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
    quantity: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    salePrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    costPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    discount: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
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
  declare slug: string;
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
    slug: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Category',
  }
);

export class Order extends Model {
  declare id: number;
  declare customerName: string;
  declare phone: string;
  declare address: string;
  declare total: number;
  declare status: string;
  declare date: Date;
}

Order.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    customerName: { type: DataTypes.STRING, allowNull: false },
    phone: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.TEXT, allowNull: false },
    total: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, modelName: 'Order' }
);

export class OrderItem extends Model {
  declare id: number;
  declare orderId: number;
  declare productId: number;
  declare quantity: number;
  declare price: number;
}

OrderItem.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    orderId: { type: DataTypes.INTEGER, allowNull: false },
    productId: { type: DataTypes.INTEGER, allowNull: false },
    quantity: { type: DataTypes.INTEGER, defaultValue: 1 },
    price: { type: DataTypes.FLOAT, allowNull: false },
  },
  { sequelize, modelName: 'OrderItem' }
);

export function toSlug(name: string) {
  return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

// Define associations
Sale.belongsTo(Product, { foreignKey: 'productId', onDelete: 'CASCADE' });
Product.hasMany(Sale, { foreignKey: 'productId', onDelete: 'CASCADE' });
Order.hasMany(OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Product, { foreignKey: 'productId' });

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
