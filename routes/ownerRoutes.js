const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ownerController');
const upload  = require('../middleware/upload');
const { requireRole } = require('../middleware/auth');

router.use(requireRole('owner'));

router.get('/dashboard',                       ctrl.getDashboard);

// Shop setup
router.get('/shop/setup',                      ctrl.getShopSetup);
router.post('/shop/setup', upload.single('cover_image'), ctrl.postShopSetup);

// Services
router.get('/services',                        ctrl.getServices);
router.get('/services/new',                    ctrl.getNewService);
router.post('/services/new',  upload.array('photos', 10), ctrl.postNewService);
router.get('/services/:id/edit',               ctrl.getEditService);
router.post('/services/:id/edit', upload.array('photos', 10), ctrl.postEditService);
router.post('/services/:id/delete',            ctrl.deleteService);
router.post('/services/photos/:photoId/delete', ctrl.deletePhoto);

// Bookings
router.get('/bookings',                        ctrl.getBookings);
router.post('/bookings/:id/status',            ctrl.updateBookingStatus);

// Wallet
router.get('/wallet',                          ctrl.getWallet);

module.exports = router;
