const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/clientController');
const { requireRole } = require('../middleware/auth');

router.use(requireRole('client'));

router.get('/dashboard',              ctrl.getDashboard);
router.get('/shops',                  ctrl.getShops);
router.get('/shops/:shopId',          ctrl.getShopDetail);
router.get('/book/:serviceId',        ctrl.getBookingForm);
router.post('/book/:serviceId',       ctrl.postBooking);
router.get('/bookings',               ctrl.getBookings);
router.post('/bookings/:id/cancel',   ctrl.cancelBooking);

module.exports = router;
