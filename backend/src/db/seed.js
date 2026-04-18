'use strict';

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mysql = require('mysql2/promise');

const products = [
  { name: 'Wireless Headphones',    description: 'Premium over-ear headphones with active noise cancellation, 30-hour battery life, and foldable design for travel.',        price: 79.99,  emoji: '🎧', category: 'Electronics', stock: 50 },
  { name: 'Mechanical Keyboard',    description: 'Compact TKL mechanical keyboard with Cherry MX Brown switches, RGB backlighting, and USB-C connectivity.',                price: 89.99,  emoji: '⌨️', category: 'Electronics', stock: 30 },
  { name: 'Running Sneakers',       description: 'Lightweight performance running shoes with responsive foam sole, breathable mesh upper, and reflective detailing.',        price: 64.99,  emoji: '👟', category: 'Footwear',    stock: 75 },
  { name: 'Stainless Water Bottle', description: 'Double-walled vacuum insulated 32 oz bottle. Keeps drinks cold 24 h or hot 12 h. BPA-free, leak-proof lid.',              price: 29.99,  emoji: '🍶', category: 'Kitchen',     stock: 120 },
  { name: 'Yoga Mat',               description: 'Extra-thick 6mm non-slip yoga mat with alignment lines, carrying strap, and eco-friendly TPE material.',                  price: 34.99,  emoji: '🧘', category: 'Sports',      stock: 60 },
  { name: 'Desk Lamp',              description: 'LED desk lamp with 5 color temperatures, touch dimmer, USB charging port, and adjustable swing arm.',                     price: 39.99,  emoji: '🪔', category: 'Home',        stock: 45 },
  { name: 'Backpack',               description: '30L laptop backpack with padded 15" sleeve, USB charging port, anti-theft pocket, and water-resistant fabric.',           price: 54.99,  emoji: '🎒', category: 'Bags',        stock: 40 },
  { name: 'Smartwatch',             description: 'Fitness smartwatch with heart-rate monitor, GPS, sleep tracking, 7-day battery, and 5ATM water resistance.',              price: 129.99, emoji: '⌚', category: 'Electronics', stock: 25 },
  { name: 'Sunglasses',             description: 'Polarised UV400 sunglasses in a lightweight TR90 frame. Includes hard case and microfibre cleaning cloth.',               price: 24.99,  emoji: '🕶️', category: 'Accessories', stock: 90 },
  { name: 'Ceramic Coffee Mug',     description: 'Handcrafted 12 oz ceramic mug with ergonomic handle, dishwasher safe, available in earthy matte glaze finish.',           price: 14.99,  emoji: '☕', category: 'Kitchen',     stock: 150 },
  { name: 'Portable Charger',       description: '20,000 mAh power bank with 65W USB-C PD fast charging, LED display, and simultaneous three-device charging.',             price: 49.99,  emoji: '🔋', category: 'Electronics', stock: 55 },
  { name: 'Scented Candle Set',     description: 'Set of 4 soy-wax candles in eucalyptus, vanilla, lavender & sandalwood. 45-hour burn time each.',                        price: 32.99,  emoji: '🕯️', category: 'Home',        stock: 80 },
  { name: 'Resistance Bands Kit',   description: '5-piece latex resistance band set with handles, ankle straps, door anchor, and carry bag. 10–50 lb resistance levels.',  price: 22.99,  emoji: '🏋️', category: 'Sports',      stock: 100 },
  { name: 'Notebook Set',           description: 'Pack of 3 A5 dot-grid notebooks with 200 pages each, thread-bound, lay-flat design, and pocket inside cover.',           price: 18.99,  emoji: '📓', category: 'Stationery',  stock: 200 },
  { name: 'Indoor Plant',           description: 'Low-maintenance 4" potted succulent arrangement in a terracotta pot. Perfect for desks and windowsills.',                 price: 12.99,  emoji: '🌵', category: 'Garden',      stock: 60 },
  { name: 'Bluetooth Speaker',      description: 'IP67 waterproof Bluetooth 5.3 speaker, 360° sound, 12-hour playtime, and built-in mic for hands-free calls.',             price: 59.99,  emoji: '🔊', category: 'Electronics', stock: 35 },
  { name: 'Wooden Chess Set',       description: 'Hand-carved wooden chess set with 3" king, felted base pieces, and folding board that doubles as a storage box.',         price: 44.99,  emoji: '♟️', category: 'Games',       stock: 20 },
  { name: 'Wool Throw Blanket',     description: 'Super-soft 50×60" merino-blend throw blanket with fringed edges. Machine washable, available in 6 neutral tones.',       price: 49.99,  emoji: '🧣', category: 'Home',        stock: 70 },
  { name: 'Cooking Apron',          description: 'Durable waxed canvas apron with adjustable neck strap, two front pockets, and cross-back ties for comfort.',             price: 27.99,  emoji: '👩‍🍳', category: 'Kitchen',     stock: 55 },
  { name: 'Polaroid Camera',        description: 'Instant film camera with built-in flash, selfie mirror, double-exposure mode, and 10-sheet film pack included.',          price: 74.99,  emoji: '📷', category: 'Electronics', stock: 18 },
];

const reviews = [
  // Wireless Headphones (1)
  [1, 'Alice M.',   5, 'Incredible sound quality and the ANC is genuinely impressive. Battery lasted a full week of commuting.'],
  [1, 'Bob K.',     4, 'Very comfortable for long sessions. Wish the case were included but otherwise great value.'],
  [1, 'Carlos R.',  5, 'Best headphones I have owned under $100. Clear highs and punchy bass.'],
  // Mechanical Keyboard (2)
  [2, 'Diana P.',   5, 'The Brown switches feel amazing and the RGB lighting is stunning. Build quality is top-notch.'],
  [2, 'Ethan W.',   4, 'Great keyboard — compact layout took a day to get used to but now I love it.'],
  [2, 'Fiona L.',   3, 'Good keyboard but the software for lighting control only runs on Windows.'],
  // Running Sneakers (3)
  [3, 'George T.',  5, 'Super lightweight and cushioning is perfect for long runs. No blisters after 10 miles.'],
  [3, 'Hannah S.',  4, 'Stylish and comfortable. I wear them for casual use too.'],
  // Stainless Water Bottle (4)
  [4, 'Ivan B.',    5, 'Ice cubes were still there after 24 hours in a hot car. Truly impressive insulation.'],
  [4, 'Julia N.',   4, 'Love the size. Lid is 100% leak-proof. Only minor gripe is it\'s a bit heavy.'],
  [4, 'Kevin M.',   5, 'Replaced all my plastic bottles with these. Highly recommend.'],
  // Yoga Mat (5)
  [5, 'Laura Q.',   5, 'Great grip even during hot yoga. The alignment lines are a helpful touch.'],
  [5, 'Mike D.',    4, 'Thick and supportive. Rolled up nicely with the strap.'],
  // Desk Lamp (6)
  [6, 'Nancy C.',   5, 'The touch dimmer is responsive and the light is warm without eye strain. USB port is handy.'],
  [6, 'Oscar R.',   4, 'Solid lamp. Arm is flexible and sturdy. Worth every penny.'],
  // Backpack (7)
  [7, 'Patricia F.',5, 'Fits my 15" MacBook perfectly and the USB port is very convenient. Gets many compliments.'],
  [7, 'Quinn A.',   4, 'Well built and lots of compartments. Feels very organised.'],
  [7, 'Rachel T.',  3, 'Shoulder straps are a bit thin for heavy loads but it looks great.'],
  // Smartwatch (8)
  [8, 'Sam H.',     5, 'GPS accuracy is spot-on during outdoor runs. Sleep tracking is detailed and useful.'],
  [8, 'Tina J.',    4, 'Battery easily lasts the promised 7 days on normal use. App is intuitive.'],
  // Sunglasses (9)
  [9, 'Uma P.',     5, 'Polarisation makes a big difference driving. Lightweight and fits well.'],
  [9, 'Victor L.',  4, 'Great price for polarised lenses. Hard case protects them well.'],
  // Ceramic Coffee Mug (10)
  [10, 'Wendy B.',  5, 'Beautiful glaze and feels solid in the hand. My morning coffee tastes better somehow!'],
  [10, 'Xavier Y.', 4, 'Exactly as pictured. Survived the dishwasher without fading.'],
  // Portable Charger (11)
  [11, 'Yara Z.',   5, 'Charged my laptop and phone simultaneously on a 12-hour flight. Lifesaver.'],
  [11, 'Zoe K.',    4, 'LED display is accurate. 65W output is faster than I expected.'],
  // Scented Candle Set (12)
  [12, 'Aaron S.',  5, 'The eucalyptus scent is perfect for the bath. All four are lovely.'],
  [12, 'Beth N.',   4, 'Long burn time and clean, not overpowering scent. Great gift.'],
  // Resistance Bands (13)
  [13, 'Chris M.',  5, 'The full kit is excellent. Door anchor on the heaviest band works perfectly.'],
  [13, 'Dana P.',   4, 'Great for home workouts. Bands are strong and have not snapped despite heavy use.'],
  // Notebook Set (14)
  [14, 'Elle T.',   5, 'Dot-grid is exactly what I wanted for bullet journaling. Paper is thick, no bleed.'],
  [14, 'Frank R.',  4, 'Good notebooks. Lay-flat binding is a real plus.'],
  // Indoor Plant (15)
  [15, 'Grace W.',  5, 'Came perfectly packaged. Healthy and thriving on my desk two months later.'],
  [15, 'Hank B.',   4, 'Cute arrangement. Easy to care for. Great desk accessory.'],
  // Bluetooth Speaker (16)
  [16, 'Iris L.',   5, '360° sound really fills the room. Waterproof so I use it in the shower too.'],
  [16, 'Jake M.',   4, 'Excellent bass and call quality on built-in mic. Would like longer playtime.'],
  // Chess Set (17)
  [17, 'Kate S.',   5, 'Beautiful craftsmanship. The board is sturdy and storage inside is convenient.'],
  [17, 'Leo A.',    4, 'Wonderful gift. Pieces feel weighty and premium.'],
  // Wool Blanket (18)
  [18, 'Mia C.',    5, 'Incredibly soft. Washed it several times and it has not pilled or shrunk.'],
  [18, 'Ned H.',    4, 'Great weight and warmth. Fringe adds a nice touch.'],
  // Cooking Apron (19)
  [19, 'Olivia T.', 5, 'Cross-back design is so much more comfortable than neck straps. Highly recommend.'],
  [19, 'Pete R.',   4, 'Durable and easy to wipe clean. Pockets are deep enough for a phone.'],
  // Polaroid Camera (20)
  [20, 'Quinn B.',  5, 'So much fun at parties! Photos come out vibrant and the selfie mirror is surprisingly useful.'],
  [20, 'Rosa K.',   4, 'Love the instant film experience. Double exposure mode is a great creative feature.'],
];

async function seed() {
  const conn = await mysql.createConnection({
    host:     process.env.DB_HOST     || 'localhost',
    port:     parseInt(process.env.DB_PORT || '3306', 10),
    user:     process.env.DB_USER     || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME     || 'ecomm',
    multipleStatements: false,
  });

  try {
    console.log('🌱  Seeding products…');
    // Truncate in dependency order to respect FK constraints
    await conn.execute('DELETE FROM reviews');
    await conn.execute('DELETE FROM cart_items');
    await conn.execute('DELETE FROM products');
    await conn.execute('ALTER TABLE reviews AUTO_INCREMENT = 1');
    await conn.execute('ALTER TABLE cart_items AUTO_INCREMENT = 1');
    await conn.execute('ALTER TABLE products AUTO_INCREMENT = 1');

    for (const p of products) {
      await conn.execute(
        'INSERT INTO products (name, description, price, emoji, category, stock) VALUES (?, ?, ?, ?, ?, ?)',
        [p.name, p.description, p.price, p.emoji, p.category, p.stock]
      );
    }
    console.log(`   ✔  Inserted ${products.length} products`);

    console.log('🌱  Seeding reviews…');
    for (const [product_id, reviewer_name, rating, comment] of reviews) {
      await conn.execute(
        'INSERT INTO reviews (product_id, reviewer_name, rating, comment) VALUES (?, ?, ?, ?)',
        [product_id, reviewer_name, rating, comment]
      );
    }
    console.log(`   ✔  Inserted ${reviews.length} reviews`);

    console.log('✅  Seed complete.');
  } finally {
    await conn.end();
  }
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err.message);
  process.exit(1);
});
