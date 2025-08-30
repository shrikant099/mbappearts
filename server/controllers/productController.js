// controllers/productController.js
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import { uploadImageToCloudinary } from '../utils/imageUploader.js';

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
    filters.category = new mongoose.Types.ObjectId(query.category);
  }
  
  // Room type filter
  if (query.roomType) {
    filters.roomType = { $in: query.roomType.split(',') };
  }
  
  // Style filter
  if (query.style) {
    filters.style = { $in: query.style.split(',') };
  }
  
  // Material filter
  if (query.material) {
    filters.material = { $in: query.material };
  }
  
  // Color filter
  if (query.color) {
    filters.color = { $in: query.color.split(',') };
  }
  
  // Assembly required filter
  if (query.assemblyRequired) {
    filters.assemblyRequired = query.assemblyRequired === 'true';
  }
  
  // Eco-friendly filter
  if (query.ecoFriendly) {
    filters.ecoFriendly = query.ecoFriendly === 'true';
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


// Create a new furniture product
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
      req.body.slug = req.body.name.toLowerCase()
        .replace(/ /g, '-')
        .replace(/[^\w-]+/g, '');
    }

    // Parse dimensions if provided as string
    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      req.body.dimensions = JSON.parse(req.body.dimensions);
    }

    // Parse features if provided as string
    if (req.body.features && typeof req.body.features === 'string') {
      req.body.features = JSON.parse(req.body.features);
    }

    // Parse variants if provided as string
    if (req.body.variants && typeof req.body.variants === 'string') {
      req.body.variants = JSON.parse(req.body.variants);
    }

    // Handle image uploads
    const imageFiles = req.files?.images;

    if (!imageFiles || imageFiles.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No images uploaded" 
      });
    }

    // Support both single and multiple images
    const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];

    const uploadedImages = [];

    for (const file of imageArray) {
      const cloudRes = await uploadImageToCloudinary(file, "Furniture-Products");
      uploadedImages.push({ 
        url: cloudRes.secure_url,
        altText: req.body.name || "Furniture product image"
      });
    }

    req.body.images = uploadedImages;
    req.body.roomSceneImages = uploadedImages.map(img => img.url);
    
    const product = new Product(req.body);
    const savedProduct = await product.save();
    
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

// Get all furniture products with pagination and filtering
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
    
    console.log('Query parameters:', req.query);

    // Build filters (excluding search from buildFilters to avoid conflicts)
    const queryWithoutSearch = { ...req.query };
    delete queryWithoutSearch.search;
    const filters = buildFilters(queryWithoutSearch);
    
    // Add status filter if provided
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    // Add search functionality - search only in product name
    if (req.query.search) {
      const searchTerm = req.query.search.trim();
      console.log('Search term:', searchTerm);
      
      if (searchTerm) {
        // Search only in the name field with partial matching
        filters.name = { $regex: searchTerm, $options: 'i' };
        
        console.log('Final filters:', JSON.stringify(filters, null, 2));
      }
    }
    
    console.log('Executing query with filters:', JSON.stringify(filters, null, 2));
    
    // Get total count for pagination
    const total = await Product.countDocuments(filters);
    console.log('Total products found:', total);
    
    // Get products with filters, pagination, and sorting
    const products = await Product.find(filters)
      .populate('brand')
      .populate('category')
      .populate('subCategory')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();
    
    console.log('Products returned:', products.length);
    
    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      products
    });
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
// Get single furniture product by ID or slug
export const getProductById = async (req, res) => {
  try {
    let product;
    
    // Check if the parameter is an ID or slug
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      product = await Product.findById(req.params.id)
        .populate('category')
        .populate('subCategory')
        .populate('brand')
        .populate('reviews.user');
    } else {
      product = await Product.findOne({ slug: req.params.id })
        .populate('category')
        .populate('subCategory')
        .populate('brand')
        .populate('reviews.user');
    }
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        message: "Product not found" 
      });
    }
    
    // Get related products (same category or style)
    const relatedProducts = await Product.find({
      $or: [
        { category: product.category },
        { style: { $in: product.style } },
        { roomType: { $in: product.roomType } }
      ],
      _id: { $ne: product._id },
      status: 'active'
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

// Update an existing furniture product
export const updateProduct = async (req, res) => {
  try {

    // Don't allow updating SKU
    if (req.body.sku) {
      delete req.body.sku;
    }

    // Parse dimensions if provided as string
    if (req.body.dimensions && typeof req.body.dimensions === 'string') {
      req.body.dimensions = JSON.parse(req.body.dimensions);
    }

    // Parse features if provided as string
    if (req.body.features && typeof req.body.features === 'string') {
      req.body.features = JSON.parse(req.body.features);
    }

    // Parse variants if provided as string
    if (req.body.variants && typeof req.body.variants === 'string') {
      req.body.variants = JSON.parse(req.body.variants);
    }

    // Check and upload new images if provided
    const imageFiles = req.files?.images;

    if (imageFiles) {
      const imageArray = Array.isArray(imageFiles) ? imageFiles : [imageFiles];
      const uploadedImages = [];

      for (const file of imageArray) {
        const cloudRes = await uploadImageToCloudinary(file, "Furniture-Products");
        uploadedImages.push({ 
          url: cloudRes.secure_url,
          altText: req.body.name || "Furniture product image"
        });
      }

      // If we want to replace images completely
      if (req.query.replaceImages === 'true') {
        req.body.images = uploadedImages;
        req.body.roomSceneImages = uploadedImages.map(img => img.url);
      } else {
        // Get existing product to append images
        const existingProduct = await Product.findById(req.params.id);
        if (existingProduct) {
          req.body.images = [...existingProduct.images, ...uploadedImages];
          req.body.roomSceneImages = [
            ...existingProduct.roomSceneImages, 
            ...uploadedImages.map(img => img.url)
          ];
        }
      }
    }

    // Update product
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    .populate('category')
    .populate('subCategory')
    .populate('brand');

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

// Delete a furniture product
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

// Get featured furniture products
export const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({ 
      isFeatured: true,
      status: 'active'
    })
    .limit(limit)
    .populate('category subCategory brand');
    
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

// Get new furniture arrivals
export const getNewArrivals = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const limit = parseInt(req.query.limit) || 8;
    const products = await Product.find({
      isNewArrival: true,
      status: 'active',
      createdAt: { $gte: thirtyDaysAgo }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('category subCategory brand');
    
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

// Get furniture products on sale
export const getProductsOnSale = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
   
    const products = await Product.find({
      isOnSale: true,
      status: 'active',
      saleStartDate: { $lte: new Date() },
      $or: [
        { saleEndDate: { $gte: new Date() } },
        { saleEndDate: { $exists: false } },
        { saleEndDate: null }
      ]
    })
    .sort({ discountPercentage: -1 })
    .limit(limit)
    .populate('category subCategory brand');
    
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

// Add or update a review for furniture
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
    
    // Populate the user info in the response
    await product.populate('reviews.user');
    
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

// Get furniture product statistics
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
          maxPrice: { $max: "$price" },
          // Furniture-specific stats
          totalAssemblyRequired: {
            $sum: { $cond: [{ $eq: ["$assemblyRequired", true] }, 1, 0] }
          },
          totalEcoFriendly: {
            $sum: { $cond: [{ $eq: ["$ecoFriendly", true] }, 1, 0] }
          }
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
          maxPrice: 1,
          totalAssemblyRequired: 1,
          totalEcoFriendly: 1
        }
      }
    ]);
    
    // Get room type distribution
    const roomTypeStats = await Product.aggregate([
      { $unwind: "$roomType" },
      { $group: { _id: "$roomType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    // Get style distribution
    const styleStats = await Product.aggregate([
      { $unwind: "$style" },
      { $group: { _id: "$style", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    res.json({ 
      success: true, 
      stats: {
        ...stats[0] || {},
        roomTypeStats,
        styleStats
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Search furniture products
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
      { 
        $text: { $search: query },
        status: 'active'
      },
      { score: { $meta: "textScore" } }
    )
    .sort({ score: { $meta: "textScore" } })
    .limit(20)
    .populate('category subCategory brand');
    
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

// Get products by room type
export const getProductsByRoomType = async (req, res) => {
  try {
    const { roomType } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filters = { 
      roomType: { $in: [roomType] },
      status: 'active'
    };
    
    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .populate('category subCategory brand')
      .skip(skip)
      .limit(limit);
    
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

// Get products by style
export const getProductsByStyle = async (req, res) => {
  try {
    const { style } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    const filters = { 
      style: { $in: [style] },
      status: 'active'
    };
    
    const total = await Product.countDocuments(filters);
    const products = await Product.find(filters)
      .populate('category subCategory brand')
      .skip(skip)
      .limit(limit);
    
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



export const createBulkProducts = async (req, res) => {
  try {
    const products = req.body.products; // Expecting an array of products

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No products provided in the request.",
      });
    }

    const savedProducts = [];

    for (let productData of products) {
      // Generate SKU if missing
      if (!productData.sku) {
        const prefix = productData.name.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        productData.sku = `${prefix}-${randomNum}`;
      }

      // Generate slug if missing
      if (!productData.slug) {
        productData.slug = productData.name.toLowerCase()
          .replace(/ /g, '-')
          .replace(/[^\w-]+/g, '');
      }

      // Parse JSON strings
      if (productData.dimensions && typeof productData.dimensions === 'string') {
        productData.dimensions = JSON.parse(productData.dimensions);
      }

      if (productData.features && typeof productData.features === 'string') {
        productData.features = JSON.parse(productData.features);
      }

      if (productData.variants && typeof productData.variants === 'string') {
        productData.variants = JSON.parse(productData.variants);
      }

      // Handle image uploads
      const uploadedImages = [];

      // If images are URLs (e.g., dummy data), just use them
      if (productData.images && Array.isArray(productData.images)) {
        for (const url of productData.images) {
          uploadedImages.push({
            url: url?.url,
            altText: url?.altText || "Furniture product image"
          });
        }
      }

      // Otherwise, if you're uploading files, you could extend this logic
      // to handle `req.files` per product, but that’s more complex and
      // depends on your frontend + formData structure.

      productData.images = uploadedImages;
      productData.roomSceneImages = uploadedImages.map(img => img.url);
      const slug = productData.slug;
      if (slug) {
        const existingProduct = await Product.findOne({ slug });
        if (!existingProduct) {
          const newProduct = new Product(productData);
          const saved = await newProduct.save();
          savedProducts.push(saved);
        }
      }

    }

    return res.status(201).json({
      success: true,
      message: `${savedProducts.length} products created successfully.`,
      products: savedProducts
    });
  } catch (error) {
    console.error("Bulk product creation error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create bulk products.",
    });
  }
};

export const getLowStockProducts = async (req, res) => {
  try {

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Sorting (default: most urgent first - lowest stock ratio)
    let sort = {};
    if (req.query.sort) {
      const sortParts = req.query.sort.split(':');
      sort[sortParts[0]] = sortParts[1] === 'desc' ? -1 : 1;
    } else {
      sort = { stock: 1 }; // Default: lowest stock first
    }

    // Build filters for low stock products
    const filters = {
      // Find products where stock is less than lowStockThreshold
      $expr: { $lt: ["$stock", "$lowStockThreshold"] },
      status: 'active' // Only active products
    };

    
    // Get total count for pagination
    const total = await Product.countDocuments(filters);

    // Fetch low stock products with aggregation for additional calculations
    const products = await Product.aggregate([
      { $match: filters },
      {
        $addFields: {
          // Calculate stock percentage (stock / lowStockThreshold * 100)
          stockPercentage: {
            $multiply: [
              { $divide: ["$stock", "$lowStockThreshold"] },
              100
            ]
          },
          // Calculate days until out of stock (assuming daily sales based on sold/30)
          estimatedDaysLeft: {
            $cond: {
              if: { $gt: ["$sold", 0] },
              then: {
                $divide: [
                  "$stock",
                  { $divide: ["$sold", 30] } // Average daily sales
                ]
              },
              else: null
            }
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $lookup: {
          from: 'brands',
          localField: 'brand',
          foreignField: '_id',
          as: 'brand'
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$brand',
          preserveNullAndEmptyArrays: true
        }
      }
    ]);

    // Calculate summary statistics
    const summaryStats = await Product.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          totalLowStockProducts: { $sum: 1 },
          totalLowStockValue: { $sum: { $multiply: ["$stock", "$price"] } },
          averageStockLevel: { $avg: "$stock" },
          criticalProducts: {
            $sum: {
              $cond: [{ $eq: ["$stock", 0] }, 1, 0]
            }
          },
          urgentProducts: {
            $sum: {
              $cond: [
                { $and: [{ $gt: ["$stock", 0] }, { $lte: ["$stock", 5] }] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const stats = summaryStats[0] || {
      totalLowStockProducts: 0,
      totalLowStockValue: 0,
      averageStockLevel: 0,
      criticalProducts: 0,
      urgentProducts: 0
    };

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      products,
      stats: {
        ...stats,
        totalLowStockValue: Math.round(stats.totalLowStockValue || 0),
        averageStockLevel: Math.round((stats.averageStockLevel || 0) * 100) / 100
      },
      message: products.length > 0 
        ? `Found ${total} products with low stock` 
        : 'No low stock products found'
    });
  } catch (error) {
    console.error('Error fetching low stock products:', error);
    res.status(500).json({
      success: false,
      message:  'Failed to fetch low stock products'
    });
  }
};