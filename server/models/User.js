import mongoose from "mongoose";



const cartItemSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product',
    required: true 
  },
  quantity: {
    type: Number,
    required: true,
    default: 1,
    min: 1
  },
  size:{
    type:String,
  },
  color:{
    type:String
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });


const userSchema = new mongoose.Schema({
    name: {type: String, required: true },
    phone: {type: Number, required: true, unique: true,minlength: 10, maxlength: 10 },
    password: {type: String, required: true },
    image:{type:String},
    accountType: {type: String, default: 'user'},
     cartItems: [cartItemSchema],
       profile: {
        email: { type: String, unique: true },
        address: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zipCode: { type: String, default: '' },
        country: { type: String, default: '' },
        age: { type: Number, min: 0 },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], default: 'Other' },
        dateOfBirth: { type: Date },
        bio: { type: String, default: '' },
        occupation: { type: String, default: '' },
        interests: [{ type: String }]
    },
  otp: String,
  otpExpires: Date,
  isActive: { type: Boolean, default: true },
}, {minimize: false})

const User = mongoose.models.user || mongoose.model('user', userSchema)

export default User