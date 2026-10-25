import welcomeOfferTemplate from './utils/welcomeOfferTemplate.js';
import fs from 'fs';

const html = welcomeOfferTemplate({
  name: 'Siva Reddy',
  code: 'SAVE84',
  discountPercent: 40,
  minAmount: 400,
  maxDiscount: 160,
  shopUrl: 'https://tracly.store',
  deals: [
    {
      _id: '1',
      name: 'BOAT STONE 1200 BLUETOOTH SPEAKER (14W)',
      image: ['https://placehold.co/200x200?text=Boat+Speaker'],
      unit: '1 unit (1 Bluetooth speaker)',
      price: 499,
      mrp: 899,
      discount: 44
    },
    {
      _id: '2',
      name: 'MAATE BABY TRAVEL BAG (BROWN)',
      image: ['https://placehold.co/200x200?text=Travel+Bag'],
      unit: '1 unit',
      price: 1500,
      mrp: 2500,
      discount: 40
    },
    {
      _id: '3',
      name: 'HAUS & KINDER BABY CARRIER(WHITE)',
      image: ['https://placehold.co/200x200?text=Baby+Carrier'],
      unit: '1 unit',
      price: 1200,
      mrp: 2000,
      discount: 40
    }
  ]
});

fs.writeFileSync('./preview_email.html', html);
console.log('Email preview written to ./preview_email.html');
