const Vehicle = require('../models/Vehicle');

exports.addVehicle = async (req, res) => {
  try {
    const user = req.user;

    // Ensure only admin can add
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admin can add vehicles' });
    }

    const {
      name, numberPlate, type, brand, capacityKg, tyres,
      fuelType, mileage
    } = req.body;

    const vehicle = new Vehicle({
      name,
      numberPlate,
      type,
      brand,
      capacityKg,
      tyres,
      fuelType,
      mileage,
      addedBy: user.id // From JWT middleware
    });

    await vehicle.save();

    res.status(201).json({ message: 'Vehicle added successfully', vehicle });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getAvailableVehicles = async (req, res) => {
  try {
    const { capacityRequired, fromPincode, toPincode, startTime } = req.query;

    // Validate required fields
    if (!capacityRequired || !fromPincode || !toPincode || !startTime) {
      return res.status(400).json({ message: 'Missing required query parameters' });
    }

    // Parse values
    const capacity = parseInt(capacityRequired);
    const from = parseInt(fromPincode);
    const to = parseInt(toPincode);
    const start = new Date(startTime);

    if (isNaN(capacity) || isNaN(from) || isNaN(to) || isNaN(start.getTime())) {
      return res.status(400).json({ message: 'Invalid query parameter formats' });
    }

    // Calculate ride duration
    const estimatedRideDurationHours = Math.abs(to - from) % 24;
    const endTime = new Date(start.getTime() + estimatedRideDurationHours * 60 * 60 * 1000);

    // Core logic - just filter by capacity for now
    const vehicles = await Vehicle.find({
      capacityKg: { $gte: capacity },
      status: 'active'
    });

    res.status(200).json({
      availableVehicles: vehicles,
      estimatedRideDurationHours,
      startTime: start,
      endTime
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.getMyAddedVehicles = async (req, res) => {
  try {
    const user = req.user;

    // Only admin should access this
    if (user.userType !== 'admin') {
      return res.status(403).json({ message: 'Only admin can view their added vehicles' });
    }

    // Find all vehicles added by this admin
    const vehicles = await Vehicle.find({ addedBy: user.id });

    res.status(200).json({
      message: 'Vehicles added by this admin',
      count: vehicles.length,
      vehicles
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
