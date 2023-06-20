const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// router.get("/user/:id", dashboardController.getUser);
// router.get("/", dashboardController.getDashboardStats);
router.get("/", dashboardController.getBookingChartData);
router.get("/getTopRatings", dashboardController.getTopRatings);
router.get('/getMostBookedItems', dashboardController.getMostBookedItems);
router.get("/GetAllUsers", dashboardController.GetAllUsers);


module.exports = router;
