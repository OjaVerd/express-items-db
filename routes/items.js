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

// ---------- GET /api/items ----------
router.get('/', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM items ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});