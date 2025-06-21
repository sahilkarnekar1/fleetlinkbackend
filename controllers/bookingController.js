const Booking = require('../models/Booking');
const Vehicle = require('../models/Vehicle');

exports.bookVehicle = async (req, res) => {
  try {
    const { vehicleId, fromPincode, toPincode, startTime } = req.body;

    const customerId = req.user.id; // Assuming user ID is available in req.user from auth middleware

    if (!customerId) {
      return res.status(401).json({ message: 'Unauthorized: User not logged in' });
    }

    if (!vehicleId || !fromPincode || !toPincode || !startTime || !customerId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Calculate estimated ride duration
    const from = parseInt(fromPincode);
    const to = parseInt(toPincode);
    const start = new Date(startTime);
    const durationHours = Math.abs(to - from) % 24;
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

    // Check for conflicting bookings
    const overlapping = await Booking.findOne({
      vehicleId,
      $or: [
        { startTime: { $lt: end }, endTime: { $gt: start } }
      ]
    });

    if (overlapping) {
      return res.status(409).json({ message: 'Vehicle already booked for this time slot' });
    }

    // Create booking
    const booking = new Booking({
      vehicleId,
      customerId,
      fromPincode,
      toPincode,
      startTime: start,
      endTime: end
    });

    await booking.save();

    res.status(201).json({ message: 'Booking successful', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getMyBookings = async (req, res) => {
  try {
    const customerId = req.user.id;

    const bookings = await Booking.find({ customerId })
      .populate('vehicleId', 'name numberPlate type capacityKg') // Optional: include vehicle details
      .sort({ startTime: -1 });

    res.status(200).json({
      message: 'My bookings fetched successfully',
      count: bookings.length,
      bookings
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.deleteMyBooking = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { bookingId } = req.params;


    if (!customerId) {
      return res.status(400).json({ message: 'Not A User' });
    } 
    const booking = await Booking.findById(bookingId);

    if (!booking) {
       return res.status(400).json({ message: 'No booking found' });
    } else if (customerId != booking.customerId) {
       return res.status(400).json({ message: 'This is not Your booking' });
    }

    await Booking.findByIdAndDelete(bookingId);

    res.status(200).json({
      message: 'Delete bookings successfully'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

