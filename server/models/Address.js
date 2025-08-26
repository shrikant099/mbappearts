import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addressType: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    required: true
  },
  recipientName: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'India'
  },
  phone: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  landmark: {
    type: String
  },
  instructions: {
    type: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Ensure only one default address per user
addressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user },
      { $set: { isDefault: false } }
    );
  }
  next();
});

const Address = mongoose.models.Address || mongoose.model('Address', addressSchema);

export default Address;