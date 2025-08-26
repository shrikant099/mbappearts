import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// POST: Create Review
export const createReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { productId, orderId } = req.params;
    const userId = req.user._id;

    // Check if the order contains the product
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const productInOrder = order.items.find(item => item.product.toString() === productId);
    if (!productInOrder) return res.status(400).json({ message: 'Product not found in this order' });

    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne({ user: userId, product: productId, order: orderId });
    if (alreadyReviewed) return res.status(400).json({ message: 'You have already reviewed this product for this order' });

    const review = new Review({ user: userId, product: productId, order: orderId, rating, comment });
    await review.save();

    res.status(201).json({ message: 'Review added', review });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: Reviews by Product
export const getReviewsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ product: productId }).populate('user', 'name image');

    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / (reviews.length || 1);

    res.json({
      count: reviews.length,
      averageRating: avgRating.toFixed(1),
      reviews
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET: Single User's Review for a Product
export const getUserReviewForProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const review = await Review.findOne({ product: productId, user: userId });

    if (!review) return res.status(404).json({ message: 'No review found for this product by the user' });

    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT: Update Review
export const updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const { reviewId } = req.params;
    const userId = req.user._id;

    // Find review by ID and user
    const review = await Review.findOne({ _id: reviewId, user: userId });
    if (!review) {
      return res.status(404).json({ message: 'Review not found or not authorized' });
    }

    // Update fields if provided
    review.rating = rating ?? review.rating;
    review.comment = comment ?? review.comment;

    await review.save();

    res.json({ message: 'Review updated successfully', review });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
};



export const getTopReviews = async (req, res) => {
  try {
    // Fetch top 5 reviews sorted by highest rating
    const topReviews = await Review.find()
      .sort({ rating: -1 })
      .limit(5)
      .populate('user', 'name image') // User details
      .populate('product', 'name image'); // Product details

    res.status(200).json({
      success: true,
      reviews: topReviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getOverallAverageRating = async (req, res) => {
  try {
    const reviews = await Review.find();

    if (reviews.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No reviews found',
        averageRating: 0,
      });
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const average = totalRating / reviews.length;

    res.status(200).json({
      success: true,
      averageRating: average.toFixed(1),
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching overall average rating: ' + error.message,
    });
  }
};
