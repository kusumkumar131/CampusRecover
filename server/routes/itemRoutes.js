const express = require('express');
const { body } = require('express-validator');
const { registerItem, getAllItems, getMyItems, getItemById, updateItem, deleteItem, getPublicStats } = require('../controllers/itemController');
const { protect } = require('../middleware/authMiddleware');
const validateFields = require('../middleware/validationMiddleware');

const router = express.Router();

// Public route for landing stats
router.get('/public-stats', getPublicStats);

router.use(protect);

router.route('/')
  .post(
    [
      body('name', 'Item name is required').notEmpty().trim(),
      body('category', 'Category is required').notEmpty().trim(),
      validateFields
    ],
    registerItem
  )
  .get(getAllItems);

router.get('/my-items', getMyItems);

router.route('/:id')
  .get(getItemById)
  .patch(updateItem)
  .delete(deleteItem);

module.exports = router;
