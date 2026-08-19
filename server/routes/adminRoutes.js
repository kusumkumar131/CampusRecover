const express = require('express');
const { getDashboardMetrics, getUsers, toggleSuspendUser, getItems, getReports, deleteReport } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/dashboard', getDashboardMetrics);
router.get('/users', getUsers);
router.patch('/users/:id/suspend', toggleSuspendUser);
router.get('/items', getItems);
router.get('/reports', getReports);
router.delete('/reports/:id', deleteReport);

module.exports = router;
