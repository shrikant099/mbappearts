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
  
  // Clothing Specific Attributes
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' }, // For sub-categories like T-Shirts under Men
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand' }, // Reference to Brand model
 size: {
  type: [String],
  enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '4XL', '5XL', 'One Size','1','2','3','4','5','6','7','8','9','10','11','12',''],
},
color: {
  type: [String],
  required: true,
},
  material: { type: String }, // e.g., Cotton, Polyester, etc.
  fabric: { type: String }, // More specific than material
  weight: { type: Number }, // In grams

  fit: { type: String, enum: ['Slim', 'Regular', 'Oversized', 'Relaxed',''] },
  sleeveLength: { type: String, enum: ['Short', 'Half', 'Long', 'Sleeveless',''] },

  pattern: { type: String }, // e.g., Striped, Printed, Solid, etc.
  occasion: { type: String }, // e.g., Casual, Formal, Party, etc.
  season: { type: String, enum: ['Summer', 'Winter', 'Spring', 'Fall', 'All Season',''] },
  gender: { type: String, enum: ['Men', 'Women', 'Unisex', 'Kids', 'Boys', 'Girls',''] },
  ageGroup: { type: String }, // For kids clothing
  
  // Media
  images: [{ 
    url: { type: String, required: true },
    altText: { type: String },
    isDefault: { type: Boolean, default: false }
  }],
  video: { type: String }, // URL to product video
  lookbookImages: [{ type: String }], // Styled images
  
  // Variants
  variants: [{
    color: String,
    size: String,
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
  weight: { type: Number }, // In grams
  shippingClass: { type: String },
  freeShipping: { type: Boolean, default: false },
  
  // Additional Information
  careInstructions: { type: String },
  tags: [{ type: String }],
  customFields: mongoose.Schema.Types.Mixed, // For any additional custom fields
  
  // Status
  status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft' },
  
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

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ ratings: -1 });

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