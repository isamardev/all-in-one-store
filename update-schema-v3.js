const { Sequelize, DataTypes } = require('sequelize');
const pg = require('pg');

const sequelize = new Sequelize('postgresql://neondb_owner:npg_wM7k4yolpxOL@ep-holy-hat-ao3titjr-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require', {
  dialect: 'postgres',
  dialectModule: pg,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },
  logging: console.log,
});

async function updateSchema() {
  try {
    console.log('Connecting to Neon...');
    await sequelize.authenticate();
    console.log('✅ Connected!');
    
    console.log('Adding new columns if they do not exist...');
    
    // Add salePrice to Products
    await sequelize.query('ALTER TABLE "Products" ADD COLUMN IF NOT EXISTS "salePrice" FLOAT DEFAULT 0');
    
    // Add quantity and discount to Sales
    await sequelize.query('ALTER TABLE "Sales" ADD COLUMN IF NOT EXISTS "quantity" INTEGER DEFAULT 1');
    await sequelize.query('ALTER TABLE "Sales" ADD COLUMN IF NOT EXISTS "discount" FLOAT DEFAULT 0');
    
    console.log('✅ Schema updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating schema:', error);
    process.exit(1);
  }
}

updateSchema();
