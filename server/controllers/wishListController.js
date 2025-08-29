import User from '../models/User.js'; // Adjust the path as needed
import Product from '../models/Product.js'; // Adjust the path as needed

// @desc    Add a product to the user's wishlist
// @route   POST /api/users/wishlist
// @access  Private (Authentication Required)
export const addProductToWishlist = async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Check if the product is already in the wishlist
    const isProductInWishlist = user.wishlistItems.some(
      (item) => item.product.toString() === productId
    );

    if (isProductInWishlist) {
      return res.status(409).json({ message: 'Product is already in your wishlist.' });
    }

    // Add the new product to the wishlist
    user.wishlistItems.push({ product: productId, addedAt: new Date() });
    await user.save();

    res.status(200).json({
      message: 'Product added to wishlist successfully.',
      wishlist: user.wishlistItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while adding the product to the wishlist.', error: error.message });
  }
};

export const removeProductFromWishlist = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Filter out the product to be removed
    const initialLength = user.wishlistItems.length;
    user.wishlistItems = user.wishlistItems.filter(
      (item) => item.product.toString() !== productId
    );

    if (user.wishlistItems.length === initialLength) {
      return res.status(404).json({ message: 'Product not found in your wishlist.' });
    }

    await user.save();

    res.status(200).json({
      message: 'Product removed from wishlist successfully.',
      wishlist: user.wishlistItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while removing the product from the wishlist.', error: error.message });
  }
};


export const clearWishlist = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Clear the wishlist array
    user.wishlistItems = [];
    await user.save();

    res.status(200).json({ message: 'Wishlist cleared successfully.', wishlist: [] });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while clearing the wishlist.', error: error.message });
  }
};

export const getWishlistItems = async (req, res) => {
  const userId = req.user._id; // Assuming user ID is available from authentication middleware

  try {
const user = await User.findById(userId)
  .populate({
    path: 'wishlistItems.product',
    populate: [
      { path: 'brand' },
      { path: 'category' }
    ]
  });

    
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ wishlist: user.wishlistItems });

  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching the wishlist.', error: error.message });
  }
};