
// controllers/productController.js
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import {uploadImageToCloudinary} from '../utils/imageUploader.js'

// Helper function for building filters
const buildFilters = (query) => {
  const filters = {};
  
  // Price range filter
  if (query.minPrice || query.maxPrice) {
    filters.price = {};
    if (query.minPrice) filters.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filters.price.$lte = Number(query.maxPrice);
  }
  
  // Category filter
  if (query.category) {
    filters.category = mongoose.Types.ObjectId(query.category);
  }
  
  // Size filter
  if (query.size) {
    filters.size = { $in: query.size.split(',') };
  }
  
  // Color filter
  if (query.color) {
    filters.color = { $in: query.color.split(',') };
  }
  
  // Gender filter
  if (query.gender) {
    filters.gender = query.gender;
  }
  
  // Search term filter
  if (query.search) {
    filters.$text = { $search: query.search };
  }
  
  // Featured products
  if (query.featured === 'true') {
    filters.isFeatured = true;
  }
  
  // New arrivals
  if (query.newArrivals === 'true') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    filters.createdAt = { $gte: thirtyDaysAgo };
    filters.isNewArrival = true;
  }
  
  // On sale products
  if (query.onSale === 'true') {
    filters.isOnSale = true;
    filters.saleStartDate = { $lte: new Date() };
    filters.saleEndDate = { $gte: new Date() };
  }
  
  return filters;
};

// Create a new product
export const createProduct = async (req, res) => {
  try {
    // Generate SKU if not provided
    if (!req.body.sku) {
      const prefix = req.body.name.substring(0, 3).toUpperCase();
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      req.body.sku = `${prefix}-${randomNum}`;
    }
    
    // Generate slug if not provided
    if (!req.body.slug) {
      req.body.slug = req.body.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
    }

     const imageFiles = req.files?.images;

    if (!imageFiles || imageFiles.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images uploaded" });
    }

    // Support both single and multiple images
    const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    const uploadedImages = [];

for (const file of imageArray) {
  const cloudRes = await uploadImageToCloudinary(file, "UKF-Products");
  uploadedImages.push({ url: cloudRes.secure_url }); // 👈 structure matters
}

req.body.images = uploadedImages;
req.body.lookbookImages = uploadedImages.map(img => img.url);
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
    console.log(savedProduct)
    res.status(201).json({ 
      success: true, 
      product: savedProduct 
    });
  } catch (error) {

    console.error(error);

    res.status(400).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get all products with pagination and filtering
export const getAllProducts = async (req, res) => {
  try {
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Sorting
    let sort = {};
    if (req.query.sort) {
      const sortParts = req.query.sort.split(':');
      sort[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { createdAt: -1 }; // Default sort by newest
    }
    
    // Build filters
const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.search) {
      filters.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    // Get total count for pagination
    const total = await Product.countDocuments(filters);
    
    // Get products with filters, pagination, and sorting
  const products = await Product.find(filters)
      .populate('brand')
      .populate('category')
      .skip(skip)
      .limit(limit)
      .lean() // Convert to plain JavaScript objects
      .then(products => products.map(product => ({
        ...product,
        // Fix image URLs
        images: product.images.map(img => {
          // If image is already a string, return as is
          if (typeof img === 'string') return { url: img, isDefault: false };
          
          // If image is broken into characters, reconstruct
          if (img['0']) {
            const url = Object.keys(img)
              .filter(k => !isNaN(k))
              .sort((a, b) => a - b)
              .map(k => img[k])
              .join('');
            return { 
              url, 
              isDefault: img.isDefault || false,
              _id: img._id 
            };
          }
          
          return img;
        })
      })));

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      products
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single product by ID or slug
export const getProductById = async (req, res) => {
  try {
    let product;
    
    // Check if the parameter is an ID or slug
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id)
        .populate('category')
        .populate('brand')
        .populate('reviews.user');
    } else {
      product = await Product.findOne({ slug: req.params.id })
        .populate('category')
        .populate('brand')
        .populate('reviews.user');
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    // Get related products (same category)
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);
    
    res.json({ 
      success: true, 
      product,
      relatedProducts 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update an existing product
export const updateProduct = async (req, res) => {
  try {
    // Don't allow updating SKU
    if (req.body.sku) {
      delete req.body.sku;
    }

    // Check and upload new images if provided
    const imageFiles = req.files?.images;

    if (imageFiles) {
      const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      const uploadedImages = [];

      for (const file of imageArray) {
        const cloudRes = await uploadImageToCloudinary(file, "UKF-Products");
        uploadedImages.push({ url: cloudRes.secure_url });
      }

      // Replace or append to existing image field
      req.body.images = uploadedImages;
      req.body.lookbookImages = uploadedImages.map(img => img.url);
    }

    // Update product
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category').populate('brand');

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    res.json({
      success: true,
      product: updated
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    res.json({ 
      success: true, 
      message: "Product deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ isFeatured: true })
      .limit(limit)
      .populate('category brand');
    
    res.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get new arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({
      isNewArrival: true,
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category brand');
    
    res.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get products on sale
export const getProductsOnSale = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
   
    const products = await Product.find({
      isOnSale: true,
      saleStartDate: { $lte: new Date() },
      saleEndDate: { $gte: new Date() }
    })
    .sort({ discountPercentage: -1 })
    .limit(limit)
    .populate('category brand');
    
    res.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add or update a review
export const addProductReview = async (req, res) => {
  try {
    const { rating, comment, title } = req.body;
    const userId = req.user._id; // Assuming you have user auth
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    // Check if user already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(
      r => r.user.toString() === userId.toString()
    );
    
    const review = {
      user: userId,
      rating: Number(rating),
      title,
      comment,
      verifiedPurchase: true // You might want to verify if user actually purchased
    };
    
    if (existingReviewIndex >= 0) {
      // Update existing review
      product.reviews[existingReviewIndex] = review;
    } else {
      // Add new review
      product.reviews.push(review);
    }
    
    // Recalculate average rating
    const totalRatings = product.reviews.reduce(
      (acc, item) => item.rating + acc, 0
    );
    product.ratings.average = totalRatings / product.reviews.length;
    
    // Update rating breakdown
    product.ratings.breakdown = {
      1: product.reviews.filter(r => r.rating === 1).length,
      2: product.reviews.filter(r => r.rating === 2).length,
      3: product.reviews.filter(r => r.rating === 3).length,
      4: product.reviews.filter(r => r.rating === 4).length,
      5: product.reviews.filter(r => r.rating === 5).length
    };
    
    product.ratings.count = product.reviews.length;
    
    await product.save();
    
    res.json({ 
      success: true, 
      product 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get product statistics
export const getProductStats = async (req, res) => {
  try {
    const stats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          totalSold: { $sum: "$sold" },
          averagePrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" }
        }
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalStock: 1,
          totalSold: 1,
          averagePrice: { $round: ["$averagePrice", 2] },
          minPrice: 1,
          maxPrice: 1
        }
      }
    ]);
    
    res.json({ 
      success: true, 
      stats: stats[0] || {} 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ 
        success: false, 
        message: "Search query is required" 
      });
    }
    
    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(10)
    .populate('category');
    
    res.json({ 
      success: true, 
      products 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};