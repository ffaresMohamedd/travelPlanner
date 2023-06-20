const User = require('../models/userModel');
const OverallStatModel = require('../models/overallStateModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const bookingModel = require('../models/booking.model');
const reviewModel = require('../models/review.model');
const Factory = require('./handlerFactory');

// exports.getDashboardStats = catchAsync(async (req, res) => {
//     // hardcoded values
//     const currentMonth = "january";
//     const currentYear = 2023;
//     const currentDay = "2023-1-15";

//     /* Recent Transactions */
//     const booking = await bookingModel.find()
//       .limit(50)
//       .sort({ createdOn: -1 });

//     /* Overall Stats */
//     const overallStat = await OverallStatModel.find({ year: currentYear });
//     console.log(`overallState: ${overallStat.length}`);
//     console.log(`overallState: ${typeof overallStat}`);

//     const {
//       totalUsers,
//       yearlyTotalSoldUnits,
//       yearlyBookingsTotal,
//       monthlyData,
//       bookingsByCategory,
//     } = overallStat[0];

//     const thisMonthStats = overallStat[0].monthlyData.find(({ month }) => {
//       return month === currentMonth;
//     });

//     const todayStats = overallStat[0].dailyData.find(({ date }) => {
//       return date === currentDay;
//     });

//     res.status(200).json({
//       totalUsers,
//       yearlyTotalSoldUnits,
//       yearlyBookingsTotal,
//       monthlyData,
//       bookingsByCategory,
//       thisMonthStats,
//       todayStats,
//       booking,
//     });
// });

exports.GetAllUsers = Factory.getAll(User);

exports.getBookingChartData = catchAsync(async (req, res, next) => {
  // Get the current date
  const currentDate = new Date();

  // Get the start of the day
  const startOfDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  );

  // Calculate the start of the month
  const startOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );

  // Calculate the start of the year
  const startOfYear = new Date(currentDate.getFullYear(), 0, 1);

  try {
    // Get daily bookings
    const dailyBookings = await bookingModel.find({
      CreatedAt: { $gte: startOfDay },
    });

    // Get monthly bookings
    const monthlyBookings = await bookingModel.find({
      CreatedAt: { $gte: startOfMonth },
    });

    // Get yearly bookings
    const yearlyBookings = await bookingModel.find({
      CreatedAt: { $gte: startOfYear },
    });

    res.status(200).json({
      status: 'success',
      data: {
        dailyBookings,
        monthlyBookings,
        yearlyBookings,
      },
    });
  } catch (err) {
    return next(
      new AppError(`Could not retrieve booking data: ${err.message}`, 400)
    );
  }
});

exports.getTopRatings = catchAsync(async (req, res, next) => {
  // Get the top 5 rated companies
  const topRatedCompanies = await reviewModel.aggregate([
    {
      $match: { company: { $exists: true } },
    },
    {
      $group: {
        _id: '$company',
        averageRating: { $avg: '$rating' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: '$company',
    },
    {
      $project: {
        _id: '$company._id',
        name: '$company.name',
        rating: '$averageRating',
      },
    },
    {
      $sort: { rating: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  // Get the top 5 rated tours
  const topRatedTours = await reviewModel.aggregate([
    {
      $match: { tour: { $exists: true } },
    },
    {
      $group: {
        _id: '$tour',
        averageRating: { $avg: '$rating' },
      },
    },
    {
      $lookup: {
        from: 'tours',
        localField: '_id',
        foreignField: '_id',
        as: 'tour',
      },
    },
    {
      $unwind: '$tour',
    },
    {
      $project: {
        _id: '$tour._id',
        name: '$tour.name',
        rating: '$averageRating',
      },
    },
    {
      $sort: { rating: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  // Get the top 5 rated trip programs
  const topRatedTripPrograms = await reviewModel.aggregate([
    {
      $match: { tripProgram: { $exists: true } },
    },
    {
      $group: {
        _id: '$tripProgram',
        averageRating: { $avg: '$rating' },
      },
    },
    {
      $lookup: {
        from: 'tripprograms',
        localField: '_id',
        foreignField: '_id',
        as: 'tripProgram',
      },
    },
    {
      $unwind: '$tripProgram',
    },
    {
      $project: {
        _id: '$tripProgram._id',
        name: '$tripProgram.name',
        rating: '$averageRating',
      },
    },
    {
      $sort: { rating: -1 },
    },
    {
      $limit: 5,
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      topRatedCompanies,
      topRatedTours,
      topRatedTripPrograms,
    },
  });
});

exports.getMostBookedItems = catchAsync(async (req, res, next) => {
  const companies = await bookingModel.aggregate([
    {
      $group: {
        _id: '$company',
        totalBookings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'company',
      },
    },
    {
      $unwind: '$company',
    },
    {
      $sort: { totalBookings: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        totalBookings: 1,
        companyId: '$company._id',
        companyName: '$company.name',
        itemType: 'Company',
      },
    },
  ]);

  const tours = await bookingModel.aggregate([
    {
      $group: {
        _id: '$tour',
        totalBookings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'tours',
        localField: '_id',
        foreignField: '_id',
        as: 'tour',
      },
    },
    {
      $unwind: '$tour',
    },
    {
      $sort: { totalBookings: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        totalBookings: 1,
        itemId: '$tour._id',
        itemName: '$tour.name',
        itemType: 'Tour',
      },
    },
  ]);

  const tripPrograms = await bookingModel.aggregate([
    {
      $group: {
        _id: '$tripProgram',
        totalBookings: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'tripprograms',
        localField: '_id',
        foreignField: '_id',
        as: 'tripProgram',
      },
    },
    {
      $unwind: '$tripProgram',
    },
    {
      $sort: { totalBookings: -1 },
    },
    {
      $limit: 5,
    },
    {
      $project: {
        _id: 0,
        totalBookings: 1,
        itemId: '$tripProgram._id',
        itemName: '$tripProgram.name',
        itemType: 'TripProgram',
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      companies,
      tours,
      tripPrograms,
    },
  });
});
