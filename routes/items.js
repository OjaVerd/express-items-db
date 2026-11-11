const express = require('express');
const pool = require('../db');

const router = express.Router();



function isValidId(id) {
  return /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2147483647;
}


function validateItem(body, partial = false) {
  const errors = [];
  const { name, description, price, quantity } = body;

  if (!partial || name !== undefined) {
    if (typeof name !== 'string' || name.trim() === '' || name.length > 100) {
      errors.push('name is required and must be a non-empty string (max 100 chars)');
    }
  }
  if (description !== undefined && description !== null && typeof description !== 'string') {
    errors.push('description must be a string');
  }
  if (!partial || price !== undefined) {
    if (typeof price !== 'number' || !Number.isFinite(price) || price < 0) {
      errors.push('price is required and must be a number >= 0');
    }
  }
  if (quantity !== undefined) {
    if (!Number.isInteger(quantity) || quantity < 0) {
      errors.push('quantity must be an integer >= 0');
    }
  }
  return errors;
}


router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rows } = await pool.query('SELECT * FROM items WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const errors = validateItem(req.body || {});
    if (errors.length) return res.status(400).json({ errors });

    const { name, description = null, price, quantity = 0 } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO items (name, description, price, quantity)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name.trim(), description, price, quantity]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});


router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });

    const body = req.body || {};
    const errors = validateItem(body, true);
    if (errors.length) return res.status(400).json({ errors });

    const { name, description, price, quantity } = body;
    if ([name, description, price, quantity].every((v) => v === undefined)) {
      return res.status(400).json({ error: 'Provide at least one field to update' });
    }


    const { rows } = await pool.query(
      `UPDATE items
       SET name        = COALESCE($1, name),
           description = COALESCE($2, description),
           price       = COALESCE($3, price),
           quantity    = COALESCE($4, quantity)
       WHERE id = $5
       RETURNING *`,
      [
        name !== undefined ? name.trim() : null,
        description ?? null,
        price ?? null,
        quantity ?? null,
        id,
      ]
    );

    if (rows.length === 0) return res.status(404).json({ error: 'Item not found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ error: 'Invalid id' });

    const { rowCount } = await pool.query('DELETE FROM items WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Item not found' });

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;