// controllers/brandController.js
import Brand from '../models/Brand.js';
import mongoose from 'mongoose';

// Create a new brand
export const createBrand = async (req, res) => {
  try {
    const brand = new Brand(req.body);
    const savedBrand = await brand.save();
    res.status(201).json({
      success: true,
      brand: savedBrand
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Get all brands
export const getAllBrands = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.featured) filter.isFeatured = req.query.featured === 'true';
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await Brand.countDocuments(filter);
    const brands = await Brand.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 });

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
      brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get single brand by ID or slug
export const getBrandById = async (req, res) => {
  try {
    let brand;
    if (mongoose.Types.ObjectId.isValid(req.params.id)) {
      brand = await Brand.findById(req.params.id);
    } else {
      brand = await Brand.findOne({ slug: req.params.id });
    }

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    // Populate product count
    await brand.populate('productCount');

    res.json({
      success: true,
      brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update a brand
export const updateBrand = async (req, res) => {
  try {
    const updatedBrand = await Brand.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedBrand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      brand: updatedBrand
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Delete a brand
export const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get featured brands
export const getFeaturedBrands = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const brands = await Brand.find({ isFeatured: true })
      .limit(limit)
      .sort({ name: 1 });

    res.json({
      success: true,
      brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Get brands with product count
export const getBrandsWithProducts = async (req, res) => {
  try {
    const brands = await Brand.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'brand',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          slug: 1,
          logo: 1,
          productCount: { $size: '$products' }
        }
      },
      { $sort: { name: 1 } }
    ]);

    res.json({
      success: true,
      brands
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const makeBrandDeactivated = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.brandId, { status: 'inactive' }, { new: true });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand deactivated successfully',
      brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

 export const makeBrandActivated = async (req, res) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.brandId, { status: 'active' }, { new: true });

    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      message: 'Brand activated successfully',
      brand
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}