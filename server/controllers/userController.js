import User from "../models/User.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Order from "../models/Order.js";
import {uploadImageToCloudinary} from '../utils/imageUploader.js'
import twilio from 'twilio';
import dotenv from "dotenv";
import { sendOtpEmail } from "../utils/sendEmail.js";
dotenv.config();

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
// Register User : /api/user/register
export const register = async (req, res)=>{
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password){
            return res.json({success: false, message: 'Missing Details'})
        }

        const existingUser = await User.findOne({email})

        if(existingUser)
            return res.json({success: false, message: 'User already exists'})

        const hashedPassword = await bcrypt.hash(password, 10)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

   
        const user = await User.create({name, "profile.email":email, password: hashedPassword, otp, otpExpires:expiry,isActive:false})

            await sendOtpEmail({email: email, fullName: user.name, otp:otp})

        // const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});

        // res.cookie('token', token, {
        //     httpOnly: true, // Prevent JavaScript to access cookie
        //     secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        //     sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
        //     maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
        // })



        return res.json({success: true, user: {email: user?.profile?.email, name: user.name,  accountType: user.accountType,_id:user._id}})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: "Email and OTP are required" });
    }

    // Find user by profile.email
    const user = await User.findOne({ "profile.email": email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check OTP and expiry
    if (user.otp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.otpExpires < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired" });
    }

    // OTP is valid → activate account
    user.isActive = true;  // or `active` if you use that field
    user.otp = undefined;
    user.otpExpires = undefined;
    await user.save();

    // Optionally, generate JWT token
     const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, {
            httpOnly: true, // Prevent JavaScript to access cookie
            secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict', // CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, // Cookie expiration time
        })


    return res.json({
      success: true,
      message: "OTP verified successfully. Account activated.",
      user: {
        _id: user._id,
        email: user.profile.email,
        name: user.name,
        accountType: user.accountType,
        // token // uncomment if you want to return token
      }
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const sendOtpIfExpired = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ "profile.email": email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // If already active, no need for OTP
    if (user.isActive) {
      return res.status(400).json({ success: false, message: "Account already active" });
    }

    // If OTP still valid
    if (user.otp && user.otpExpires > Date.now()) {
      return res.json({ 
        success: true, 
        message: "OTP is still valid. Please check your email.", 
        expiresAt: user.otpExpires 
      });
    }

    // OTP expired → generate new OTP
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = newOtp;
    user.otpExpires = newExpiry;
    await user.save();

    // Send OTP email
    await sendOtpEmail({ email: user.profile.email, fullName: user.name, otp: newOtp });

    return res.json({ 
      success: true, 
      message: "New OTP has been sent to your email", 
      expiresAt: newExpiry 
    });

  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};



// Login User : /api/user/login

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ "profile.email":email });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Account is not available with this email address' });
    }
    if(user.isActive === false){
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Please contact support.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Wrong password' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      user: {
        email: user?.profile?.email,
        name: user.name,
        accountType: user.accountType,
        token: token,
        _id: user._id,
      },
    });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};




// Check Auth : /api/user/is-auth
export const isAuth = async (req, res)=>{
    try {
        const { userId } = req.body;
        const user = await User.findById(userId).select("-password")
        return res.json({success: true, user})

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Logout User : /api/user/logout

export const logout = async (req, res)=>{
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        });
        return res.json({ success: true, message: "Logged Out" })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Edit Profile Controller
export const updateProfile = async (req, res) => {
  try {
    const userId = req.params.id; // from route param
    const updateFields = req.body;

    console.log(updateFields);

    const updatedUser = await User.findByIdAndUpdate(userId, updateFields, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const updatePicture = async (req,res)=>{
    try{
        const userId = req.params.id; // from route param
    const {updatePicture} = req.files;

        if(!updatePicture){
            console.log("did not get the image")
            return res.json({
                success:false,
                message:"did not get picture "
            }) 
        }

        const image = await uploadImageToCloudinary(updatePicture, "UKF-Products");




    const updatedUser = await User.findByIdAndUpdate(userId, {image:image.secure_url}, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({
      success: true,
      message: "Profile Picture updated successfully",
      user: updatedUser,
    });
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}



export const getProfile = async(req, res) =>{
    try {
        const userId = req.params.id; // from route param
        const user = await User.findById(userId).select("-password");
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .populate('items.product');

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.json({ success: true, user, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}



export const sendOTPToPhone = async (phone, otp) => {
  try {
    const message = await client.messages.create({
      body: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: `+91${phone}`
    });
    
    return true;
  } catch (error) {
    console.error("Twilio error:", error);
    throw new Error('Failed to send OTP');
  }
};




export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ 'profile.email':email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otp = otp;
    user.otpExpires = expiry;
    await user.save();

     await sendOtpEmail({email: email, fullName: user.name, otp:otp})

    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword, confirmPassword } = req.body;



    // Find the user
    
    const user = await User.findOne({ 'profile.email':email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Check OTP validity
    if (otp) {
     
      if (!otp || user.otp !== otp || new Date() > user.otpExpires) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }
    }
    

    // Check if passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match' });
    }

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user fields
    user.password = hashed;
    user.otp = null;
    user.otpExpires = null;

    // Save user without triggering full validation
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};


export const getAdminDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();

    // Delivered Orders
    const deliveredOrders = await Order.find({ currentStatus: "Delivered" });

    let totalRevenue = 0;
    let totalItemsSold = 0;
    const productSalesMap = {};

    // Loop once to calculate revenue, items sold, and product sales
    deliveredOrders.forEach(order => {
      totalRevenue += order.total || 0;

      order.items.forEach(item => {
        totalItemsSold += item.quantity;

        const productId = item.product.toString();
        productSalesMap[productId] = (productSalesMap[productId] || 0) + item.quantity;
      });
    });

    // Top 5 best-selling products
    const sortedSales = Object.entries(productSalesMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const topProductsRaw = await Promise.all(
      sortedSales.map(async ([productId, quantitySold]) => {
        const product = await Product.findById(productId).select("name price images");
        if (!product) return null;
        return {
          _id: product._id,
          name: product.name,
          price: product.price,
          images: product.images,
          quantitySold
        };
      })
    );

    const topProducts = topProductsRaw.filter(p => p !== null);

    // Product stock info
    const allProducts = await Product.find().populate("category");
    const totalStock = allProducts.reduce((acc, prod) => acc + (prod.stock || 0), 0);
    const outOfStock = allProducts.filter(prod => prod.stock === 0).length;

    // Category list
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue,
        totalItemsSold,
        totalStock,
        outOfStock,
        topProducts,
        completedOrders: deliveredOrders.length,
        categories,
        products: allProducts
      }
    });

  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message
    });
  }
};


export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;
 


    const totalUsers = await User.countDocuments({ accountType: "user" });

    const users = await User.find({ accountType: "user" })
      .skip(skip)
      .limit(limit)
      .populate("cartItems.product", "name price images")
      .lean(); // lean() for faster queries and to allow modifying the result

    // Add totalOrders and totalSpent for each user
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const userOrders = await Order.find({ user: user._id , currentStatus: { $ne: 'Cancelled' }});
        const totalOrders = userOrders.length;
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

        return {
          ...user,
          userOrders,
          totalOrders,
          totalSpent,
        };
      })
    );

    res.status(200).json({
      success: true,
      totalUsers,
      currentPage: page,
      totalPages: Math.ceil(totalUsers / limit),
      users: enrichedUsers,
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch users",
    });
  }
};

export const getUserNoPagination = async (req,res)=>{
  try{

      const users = await User.find({ accountType: "user" })

    return res.status(200).json({
      success:true,
      data:users
    })

  }catch(error){
    console.log("error while getting no pagination users");
    return res.status(500).json({
      success:false,
      message:error.message,
    })
  }
}



export const getMe = async (req, res) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ success: false, message: 'Not logged in' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export const deactivateSingleUser = async (req, res) => {
  try {
    const { userId } = req.params; // or req.body.userId if using body instead

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${userId} deactivated successfully`,
    });
  } catch (error) {
    console.error('Error deactivating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

export const activateSingleUser = async (req, res) => {
  try {
    const { userId } = req.params; // or req.body.userId if using body instead

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${userId} activated successfully`,
    });
  } catch (error) {
    console.error('Error activating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// export const addIsActiveToAllUsers = async (req, res) => {
//   try {
//     const result = await User.updateMany(
//       { isActive: { $exists: false } }, // Only update users who don't have isActive
//       { $set: { isActive: true } } // Set isActive to true
//     );

//     res.status(200).json({
//       success: true,
//       message: `Updated ${result.modifiedCount} users with isActive: true`,
//     });
//   } catch (error) {
//     console.error('Error updating users:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Internal server error while updating users',
//     });
//   }
// };