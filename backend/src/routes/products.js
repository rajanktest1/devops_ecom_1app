'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// GET /api/products — list all products
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, description, price, emoji, category, stock FROM products ORDER BY id'
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /products error:', err.message);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// GET /api/products/:id — single product + its reviews
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id)) || Number(id) < 1) {
    return res.status(400).json({ error: 'Invalid product id' });
  }
  try {
    const [[product]] = await pool.execute(
      'SELECT id, name, description, price, emoji, category, stock FROM products WHERE id = ?',
      [id]
    );
    if (!product) return res.status(404).json({ error: 'Product not found' });

    const [reviews] = await pool.execute(
      'SELECT id, reviewer_name, rating, comment, created_at FROM reviews WHERE product_id = ? ORDER BY created_at DESC',
      [id]
    );
    res.json({ ...product, reviews });
  } catch (err) {
    console.error('GET /products/:id error:', err.message);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

module.exports = router;
