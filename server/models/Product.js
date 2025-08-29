// models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  // Basic Information
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, required: true },
  shortDescription: { type: String, maxlength: 160 }, // For meta description
  sku: { type: String, unique: true }, // Stock Keeping Unit
  
  // Pricing Information
  price: { type: Number, required: true },
  comparePrice: { type: Number }, // Original price for showing discounts
  costPerItem: { type: Number }, // Cost to the business
  profitMargin: { type: Number }, // Calculated field
  taxRate: { type: Number, default: 0 }, // Tax percentage
  
  // Inventory
  stock: { type: Number, required: true },
  sold: { type: Number, default: 0 },
  lowStockThreshold: { type: Number, default: 5 },
  trackInventory: { type: Boolean, default: true },
  
  // Furniture Specific Attributes
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // For sub-categories like Chairs under Living Room
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // Reference to Brand model
  
  // Furniture Dimensions
  dimensions: {
    length: { type: Number }, // in cm or inches
    width: { type: Number },
    height: { type: Number },
    unit: { type: String, enum: ['cm', 'inches'], default: 'cm' }
  },
  weight: { type: Number }, // In kg or lbs
  
  // Furniture Properties
  roomType: { 
    type: [String], 
    enum: ['Living Room', 'Bedroom', 'Dining Room','Gaming Room', 'Kitchen', 'Bathroom', 'Office', 'Outdoor', 'Entryway', 'Kids Room', 'Other']
  },
  style: {
    type: [String],
    enum: ['Modern', 'Contemporary', 'Minimalist', 'Mid-Century', 'Industrial', 'Traditional', 'Transitional', 'Rustic', 'Coastal', 'Scandinavian', 'Bohemian', 'Farmhouse', 'Art Deco', 'Asian', 'Other']
  },
  material: { 
    type: [String],
    enum: ['Wood', 'Metal', 'Glass', 'Plastic', 'Fabric', 'Leather', 'Marble', 'Stone', 'Rattan', 'Wicker', 'Bamboo', 'Other']
  },
  color: {
    type: [String],
    required: true,
  },
  finish: { type: String }, // e.g., Matte, Glossy, Distressed, etc.
  
  // Features & Functionality
  features: [{
    name: String,
    value: String
  }],
  assemblyRequired: { type: Boolean, default: false },
  assemblyTime: { type: Number }, // in minutes
  weightCapacity: { type: Number }, // in kg or lbs
  
  // Sustainability
  ecoFriendly: { type: Boolean, default: false },
  sustainableMaterials: { type: Boolean, default: false },
  certifications: [{ type: String }], // e.g., FSC, Greenguard, etc.
  
  // Media
  images: [{ 
    url: { type: String, required: true },
    altText: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  video: { type: String }, // URL to product video
  roomSceneImages: [{ type: String }], // Room setting images
  dimensionDiagram: { type: String }, // Image with dimension markings
  
  // Variants
  variants: [{
    color: String,
    material: String,
    finish: String,
    price: Number,
    stock: Number,
    sku: String,
    images: [{ type: String }]
  }],
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  keywords: [{ type: String }],
  
  // Display
  isFeatured: { type: Boolean, default: false },
  isNewArrival: { type: Boolean, default: false },
  isBestSeller: { type: Boolean, default: false },
  isOnSale: { type: Boolean, default: false },
  featuredOrder: { type: Number }, // For sorting featured products
  
  // Ratings & Reviews
  ratings: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 },
    breakdown: {
      1: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      5: { type: Number, default: 0 }
    }
  },
  reviews: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, min: 1, max: 5, required: true },
    title: { type: String },
    comment: { type: String, required: true },
    images: [{ type: String }], // Review images
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    verifiedPurchase: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Shipping
  shippingWeight: { type: Number }, // In kg or lbs
  shippingClass: { type: String },
  freeShipping: { type: Boolean, default: false },
  flatShippingRate: { type: Number }, // Fixed shipping cost if applicable
  deliveryTime: { type: String }, // e.g., "5-7 business days"
  
  // Additional Information
  careInstructions: { type: String },
  warranty: { type: String }, // Warranty information
  tags: [{ type: String }],
  customFields: mongoose.Schema.Types.Mixed, // For any additional custom fields
  
  // Status
  status: { type: String, enum: ['draft', 'active', 'archived', 'discontinued'], default: 'draft' },
  
  // Dates
  releaseDate: { type: Date }, // For pre-orders
  saleStartDate: { type: Date },
  saleEndDate: { type: Date }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
productSchema.virtual('discountPercentage').get(function() {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// Virtual for inStock status
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ roomType: 1 });
productSchema.index({ style: 1 });
productSchema.index({ material: 1 });

// Pre-save hook to calculate profit margin
productSchema.pre('save', function(next) {
  if (this.isModified('price') || this.isModified('costPerItem')) {
    if (this.price && this.costPerItem) {
      this.profitMargin = ((this.price - this.costPerItem) / this.price) * 100;
    }
  }
  next();
});

export default mongoose.model('Product', productSchema);