// models/Order.js
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: {
    type: String,
    required: true
  },
  color: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  image: {
    type: String
  }
}, { _id: false });

const orderStatusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  changedAt: {
    type: Date,
    default: Date.now
  },
  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  note: {
    type: String
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  orderId: {
    type: String,
    unique: true,
    required: true
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true
  },
  shippingFee: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    required: true,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  billingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  currentStatus: {
    type: String,
    enum: [
      'Order Placed',
      'Payment Pending',
      'Payment Received',
      'Processing',
      'Shipped',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
      'Return Requested',
      'Return Approved',
      'Return Rejected',
      'Return Completed',
      'Refund Initiated',
      'Refund Completed'
    ],
    default: 'Order Placed'
  },
  statusHistory: [orderStatusHistorySchema],
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Net Banking', 'UPI', 'COD', 'Wallet'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  paymentId: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  trackingCompany: {
    type: String
  },
  trackingUrl: {
    type: String
  },
  notes: {
    type: String
  },
  couponUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Coupon'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Generate order ID before saving
orderSchema.pre('save', function(next) {
  if (!this.orderId) {
    const date = new Date();
    const prefix = 'ORD';
    const random = Math.floor(10000 + Math.random() * 90000);
    this.orderId = `${prefix}-${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${random}`;
  }
  next();
});

// Add to status history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('currentStatus')) {
    this.statusHistory.push({
      status: this.currentStatus,
      changedBy: this.user // Assuming admin updates would modify this
    });
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

export default Order;