const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '../.env') });

const Furniture = require('../models/Furniture');
const { furnitureCatalog } = require('./furnitureCatalog');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/framespace')
  .then(async () => {
    await Furniture.deleteMany({});
    await Furniture.insertMany(furnitureCatalog);
    console.log(`Seeded ${furnitureCatalog.length} furniture items`);
    process.exit(0);
  })
  .catch(err => {
    console.error('Seed error:', err);
    process.exit(1);
  });
