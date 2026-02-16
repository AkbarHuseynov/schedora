const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/adminController');
const { requireRole } = require('../middleware/auth');

router.use(requireRole('admin'));

router.get('/dashboard',              ctrl.getDashboard);
router.get('/users',                  ctrl.getUsers);
router.post('/users/:id/toggle',      ctrl.toggleUser);
router.post('/users/:id/delete',      ctrl.deleteUser);
router.get('/shops',                  ctrl.getShops);
router.post('/shops/:id/toggle',      ctrl.toggleShop);
router.post('/shops/:id/delete',      ctrl.deleteShop);
router.post('/shops/:id/wallet',      ctrl.adjustWallet);
router.get('/bookings',               ctrl.getBookings);

module.exports = router;
