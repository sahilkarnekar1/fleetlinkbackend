const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  numberPlate: { type: String, required: true, unique: true },
  type: { type: String, required: true }, // e.g., Truck, Van, Pickup
  brand: { type: String },
  capacityKg: { type: Number, required: true },
  tyres: { type: Number, required: true },
  fuelType: { type: String, enum: ['diesel', 'petrol', 'electric'], required: true },
  mileage: { type: Number },
  status: { type: String, enum: ['active', 'maintenance', 'inactive'], default: 'active' },  
  // NEW
  addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // admin user ID
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
