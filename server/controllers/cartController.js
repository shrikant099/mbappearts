// controllers/cartController.js
import mongoose from "mongoose";
import User from "../models/User.js";
import Product from "../models/Product.js";

// Add to cart or update quantity
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.params.id;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Check product stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    // Find user and update cart
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if product already in cart
    const existingItemIndex = user.cartItems.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex >= 0) {
      // Update quantity if already in cart
      user.cartItems[existingItemIndex].quantity += quantity;
    } else {
      // Add new item to cart
      user.cartItems.push({ product: productId, quantity });
    }

    await user.save();

    // Populate cart items for response
    const populatedUser = await User.findById(userId).populate({
      path: "cartItems.product",
      select: "name price images stock",
    });

    res.json({
      success: true,
      message: "Product added to cart successfully",
      cart: populatedUser.cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.params.id;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { cartItems: { product: productId } } },
      { new: true }
    ).populate({
      path: "cartItems.product",
      select: "name price images",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Product removed from cart",
      cart: user.cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get cart items

export const getCart = async (req, res) => {
  try {
    const userId = req.params.id;

    // Validate user ID
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Get product details for products in cart
    const products = await Product.find({
      _id: { $in: user.cartItems.map((item) => item.product) },
    }).lean();

    // Format images just like in getAllProducts
    const formattedCart = user.cartItems.map((item) => {
      const product = products.find(
        (p) => p._id.toString() === item.product.toString()
      );

      return {
        product: product
          ? {
              ...product,
              images:
                product.images?.map((img) => {
                  if (typeof img === "string")
                    return { url: img, isDefault: false };

                  if (img?.["0"]) {
                    const url = Object.keys(img)
                      .filter((k) => !isNaN(k))
                      .sort((a, b) => a - b)
                      .map((k) => img[k])
                      .join("");
                    return {
                      url,
                      isDefault: img.isDefault || false,
                      _id: img._id,
                    };
                  }

                  return img;
                }) || [],
            }
          : null,
        quantity: item.quantity,
        size: item.size,        // Fixed: Added this line
        color: item.color,      // Fixed: Added this line
        addedAt: item.addedAt,
      };
    });

    res.json({
      success: true,
      cart: formattedCart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Update cart item quantity
export const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.params.id;

    // Validate inputs
    if (
      !mongoose.Types.ObjectId.isValid(productId) ||
      !mongoose.Types.ObjectId.isValid(userId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID format",
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be at least 1",
      });
    }

    // Check product stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: "Insufficient stock available",
      });
    }

    // Update cart item quantity
    const user = await User.findOneAndUpdate(
      {
        _id: userId,
        "cartItems.product": productId,
      },
      { $set: { "cartItems.$.quantity": quantity } },
      { new: true }
    ).populate({
      path: "cartItems.product",
      select: "name price images",
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User or cart item not found",
      });
    }

    res.json({
      success: true,
      message: "Cart updated successfully",
      cart: user.cartItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear cart
export const clearCart = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { cartItems: [] } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const bulkAddToCart = async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.params?.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check items is an array
    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: "Items must be an array",
      });
    }

    // Clear existing cart
    user.cartItems = [];

    // If items array is not empty, validate and add items
    if (items.length > 0) {
      for (const item of items) {
        if (!item?.productId || !item?.quantity) {
          return res.status(400).json({
            success: false,
            message: "Each item must have productId and quantity",
          });
        }

        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product not found: ${item.productId}`,
          });
        }

        if (typeof item.quantity !== "number" || item.quantity < 1) {
          return res.status(400).json({
            success: false,
            message: `Invalid quantity for product ${product.name}`,
          });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for ${product.name}`,
          });
        }

        console.log(item.size,item.color)

        user.cartItems.push({
          product: product._id,
          quantity: item.quantity,
          size: item.size,
          color:item.color,
          addedAt: new Date(),
        });
      }
    }

    // Save updated cart (even if it's empty)
    await user.save();

    // Populate cart items for response
    const populatedUser = await User.findById(userId).populate({
      path: "cartItems.product"});

    // Calculate totals
    const cartTotal = populatedUser.cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      cart: populatedUser.cartItems,
      totalItems: populatedUser.cartItems.length,
      cartTotal,
    });
  } catch (error) {
    console.error("Cart update error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

