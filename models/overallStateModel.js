const mongoose = require('mongoose');

const overallStateSchema = new mongoose.Schema(
    {
      totalUsers: Number,
      yearlyBookingsTotal: Number,
      yearlyTotalSoldUnits: Number,
      year: Number,
      monthlyData: [
        {
          month: String,
          totalBookings: Number,
          totalUnits: Number,
        },
      ],
      dailyData: [
        {
          date: String,
          totalBookings: Number,
          totalUnits: Number,
        },
      ],
      bookingsByCategory: {
        type: Map,
        of: Number,
      },
    },
    { timestamps: true }
  );
  
  
const overallState = mongoose.model('overallState', overallStateSchema);
module.exports = overallState;