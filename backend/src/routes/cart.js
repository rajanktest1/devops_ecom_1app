'use strict';

const express = require('express');
const router  = express.Router();
const pool    = require('../db/connection');

// GET /api/cart — all cart items joined with product details
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `SELECT
         ci.id,
         ci.product_id,
         ci.quantity,
         ci.added_at,
         p.name,
         p.price,
         p.emoji,
         p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       ORDER BY ci.added_at`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /cart error:', err.message);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

// POST /api/cart — add item to cart (upsert: increment qty if already present)
router.post('/', async (req, res) => {
  const { product_id, quantity = 1 } = req.body;
  if (!product_id || !Number.isInteger(Number(product_id)) || Number(product_id) < 1) {
    return res.status(400).json({ error: 'Invalid product_id' });
  }
  const qty = parseInt(quantity, 10);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }
  try {
    // Verify product exists
    const [[product]] = await pool.execute('SELECT id, stock FROM products WHERE id = ?', [product_id]);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    // Upsert: if row exists increment quantity, otherwise insert
    await pool.execute(
      `INSERT INTO cart_items (product_id, quantity)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [product_id, qty]
    );

    const [[cartItem]] = await pool.execute(
      `SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.emoji
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
       WHERE ci.product_id = ?`,
      [product_id]
    );
    res.status(201).json(cartItem);
  } catch (err) {
    console.error('POST /cart error:', err.message);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
});

// PUT /api/cart/:id — update quantity of a cart item
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  if (!Number.isInteger(Number(id)) || Number(id) < 1) {
    return res.status(400).json({ error: 'Invalid cart item id' });
  }
  const qty = parseInt(quantity, 10);
  if (!Number.isInteger(qty) || qty < 1) {
    return res.status(400).json({ error: 'quantity must be a positive integer' });
  }
  try {
    const [result] = await pool.execute(
      'UPDATE cart_items SET quantity = ? WHERE id = ?',
      [qty, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.json({ id: Number(id), quantity: qty });
  } catch (err) {
    console.error('PUT /cart/:id error:', err.message);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
});

// DELETE /api/cart/:id — remove item from cart
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  if (!Number.isInteger(Number(id)) || Number(id) < 1) {
    return res.status(400).json({ error: 'Invalid cart item id' });
  }
  try {
    const [result] = await pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cart item not found' });
    res.status(204).end();
  } catch (err) {
    console.error('DELETE /cart/:id error:', err.message);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
});

module.exports = router;
