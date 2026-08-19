const express = require('express');
const { body } = require('express-validator');
const { reportLost, reportFound, getAllReports, getMyReports, getReportById, updateReport, confirmReturn } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const validateFields = require('../middleware/validationMiddleware');

const router = express.Router();

router.use(protect);

router.post(
  '/lost',
  [
    body('itemId', 'Item ID is required').notEmpty().trim(),
    body('location', 'Last seen location is required').notEmpty().trim(),
    validateFields
  ],
  reportLost
);

router.post(
  '/found',
  [
    body('itemId', 'Item ID is required').notEmpty().trim(),
    validateFields
  ],
  reportFound
);

router.get('/', getAllReports);
router.get('/my', getMyReports);

router.route('/:id')
  .get(getReportById)
  .patch(updateReport);

router.post('/:id/confirm-return', confirmReturn);

module.exports = router;
