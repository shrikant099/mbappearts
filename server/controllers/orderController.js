import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Address from '../models/Address.js';
import mongoose from 'mongoose';
import puppeteer from "puppeteer";

import stripe from "stripe"
import { sendOrderConfirmationEmail, sendTrackingEmail } from '../utils/sendEmail.js';
// import User from "../models/User.js"

// // Place Order COD : /api/order/cod
// export const placeOrderCOD = async (req, res)=>{
//     try {
//         const { userId, items, address } = req.body;
//         if(!address || items.length === 0){
//             return res.json({success: false, message: "Invalid data"})
//         }
//         // Calculate Amount Using Items
//         let amount = await items.reduce(async (acc, item)=>{
//             const product = await Product.findById(item.product);
//             return (await acc) + product.offerPrice * item.quantity;
//         }, 0)

//         // Add Tax Charge (2%)
//         amount += Math.floor(amount * 0.02);

//         await Order.create({
//             userId,
//             items,
//             amount,
//             address,
//             paymentType: "COD",
//         });

//         return res.json({success: true, message: "Order Placed Successfully" })
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }

// // Place Order Stripe : /api/order/stripe
// export const placeOrderStripe = async (req, res)=>{
//     try {
//         const { userId, items, address } = req.body;
//         const {origin} = req.headers;

//         if(!address || items.length === 0){
//             return res.json({success: false, message: "Invalid data"})
//         }

//         let productData = [];

//         // Calculate Amount Using Items
//         let amount = await items.reduce(async (acc, item)=>{
//             const product = await Product.findById(item.product);
//             productData.push({
//                 name: product.name,
//                 price: product.offerPrice,
//                 quantity: item.quantity,
//             });
//             return (await acc) + product.offerPrice * item.quantity;
//         }, 0)

//         // Add Tax Charge (2%)
//         amount += Math.floor(amount * 0.02);

//        const order =  await Order.create({
//             userId,
//             items,
//             amount,
//             address,
//             paymentType: "Online",
//         });

//     // Stripe Gateway Initialize    
//     const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

//     // create line items for stripe

//      const line_items = productData.map((item)=>{
//         return {
//             price_data: {
//                 currency: "usd",
//                 product_data:{
//                     name: item.name,
//                 },
//                 unit_amount: Math.floor(item.price + item.price * 0.02)  * 100
//             },
//             quantity: item.quantity,
//         }
//      })

//      // create session
//      const session = await stripeInstance.checkout.sessions.create({
//         line_items,
//         mode: "payment",
//         success_url: `${origin}/loader?next=my-orders`,
//         cancel_url: `${origin}/cart`,
//         metadata: {
//             orderId: order._id.toString(),
//             userId,
//         }
//      })

//         return res.json({success: true, url: session.url });
//     } catch (error) {
//         return res.json({ success: false, message: error.message });
//     }
// }
// // Stripe Webhooks to Verify Payments Action : /stripe
export const stripeWebhooks = async (request, response)=>{
    // Stripe Gateway Initialize
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);

    const sig = request.headers["stripe-signature"];
    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            request.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        response.status(400).send(`Webhook Error: ${error.message}`)
    }

    // Handle the event
    switch (event.type) {
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId, userId } = session.data[0].metadata;
            // Mark Payment as Paid
            await Order.findByIdAndUpdate(orderId, {isPaid: true})
            // Clear user cart
            await User.findByIdAndUpdate(userId, {cartItems: {}});
            break;
        }
        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            // Getting Session Metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId,
            });

            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }
            
    
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({received: true});
}


// // Get Orders by User ID : /api/order/user
// export const getUserOrders = async (req, res)=>{
//     try {
//         const { userId } = req.body;
//         const orders = await Order.find({
//             userId,
//             $or: [{paymentType: "COD"}, {isPaid: true}]
//         }).populate("items.product address").sort({createdAt: -1});
//         res.json({ success: true, orders });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }


// // Get All Orders ( for seller / admin) : /api/order/seller

// export const getAllOrders = async (req, res)=>{
//     try {
//         const orders = await Order.find({
//             $or: [{paymentType: "COD"}, {isPaid: true}]
//         }).populate("items.product address").sort({createdAt: -1});
//         res.json({ success: true, orders });
//     } catch (error) {
//         res.json({ success: false, message: error.message });
//     }
// }


// controllers/orderController.js


// Create a new order
export const createOrder = async (req, res) => {
  try {
    const { 
      userId, 
      items, 
      shippingAddress, 
      billingAddress, 
      paymentMethod, 
      subtotal,
      shippingFee,
      tax,
      total,
      ...otherData 
    } = req.body;

    // Validate required fields
    if (!userId || !items || !shippingAddress || !paymentMethod) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: userId, items, shippingAddress, paymentMethod' 
      });
    }

    // Validate items array
    if (!Array.isArray(items)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Items must be an array' 
      });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate shipping address exists
    const shippingAddr = await Address.findById(shippingAddress);
    if (!shippingAddr) {
      return res.status(404).json({ 
        success: false, 
        message: 'Shipping address not found' 
      });
    }

    // Validate billing address if provided
    if (billingAddress) {
      const billingAddr = await Address.findById(billingAddress);
      if (!billingAddr) {
        return res.status(404).json({ 
          success: false, 
          message: 'Billing address not found' 
        });
      }
    }

    // Validate and prepare order items
    const orderItems = [];
    
    for (const item of items) {
      if (!item.productId || !item.quantity || !item.name || !item.price ||!item.color || !item.size) {
        return res.status(400).json({ 
          success: false, 
          message: 'Each item must contain productId, quantity, name, and price' 
        });
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Product not found: ${item.productId}` 
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Insufficient stock for product: ${product.name}` 
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        color: item.color,
        size : item.size,
        image: product.images[0]?.url || ''
      });
    }

    const orderId = `ORD-${new Date().getFullYear()}${(Date.now() % 1000000).toString().padStart(6, '0')}`;
    // Check if orderId already exists
    const existingOrder = await Order.findOne({ orderId });
    if (existingOrder) {  
      return res.status(400).json({
        success: false, 
        message: 'Order ID already exists, please try again'
      });
    }
    // Create order
    const order = new Order({
      orderId,  
      user: userId,
      items: orderItems,
      subtotal: subtotal || orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      shippingFee: shippingFee || 0,
      tax: tax || 0,
      total: total || (subtotal + shippingFee + tax),
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      paymentMethod,
      currentStatus: 'Order Placed',
      paymentStatus: 'Pending',
      ...otherData
    });

    await order.save();

    // Update product stock
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity, sold: item.quantity }
      });
    }
    
if(user.profile.email) {
   await sendOrderConfirmationEmail({
    email: user.profile.email,
    fullName: user.fullName || user.name,
    orderId: order.orderId,
    items: orderItems.map(i => ({
      title: i.name,
      quantity: i.quantity,
      netPrice: i.price
    })),
    shippingCharges: shippingFee,
    totalAmount: total,
    shippingInfo: {
      fullName: shippingAddr.recipientName,
      address: `${shippingAddr.street}, ${shippingAddr.city}, ${shippingAddr.state}, ${shippingAddr.postalCode}`,
      mobile: shippingAddr.phone,
    }
  });}

   return res.status(201).json({
      success: true,
      order,
      message: 'Order created successfully'
    });

  } catch (error) {
    console.error('Order creation error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
// Get all orders (admin)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, userId } = req.query;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.currentStatus = status;
    if (userId) filter.user = userId;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('billingAddress')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      orders
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get single order
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('items.product', 'name price images');

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    // Check if user is authorized (owner or admin)
    if (order.user._id.toString() !== req.user.id && req.user.accountType !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to view this order' 
      });
    }

    res.json({ 
      success: true, 
      order 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Update order status (admin)
// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { status, note } = req.body;

//     const order = await Order.findById(req.params.id);
//     if (!order) {
//       return res.status(404).json({ 
//         success: false, 
//         message: 'Order not found' 
//       });
//     }

//     // Validate status transition
//     const validTransitions = {
//       'Order Placed': ['Payment Pending', 'Cancelled'],
//       'Payment Pending': ['Payment Received', 'Cancelled'],
//       'Payment Received': ['Processing', 'Cancelled'],
//       'Processing': ['Shipped', 'Cancelled'],
//       'Shipped': ['Out for Delivery', 'Cancelled'],
//       'Out for Delivery': ['Delivered', 'Cancelled'],
//       'Delivered': ['Return Requested'],
//       'Cancelled': [],
//       'Return Requested': ['Return Approved', 'Return Rejected'],
//       'Return Approved': ['Return Completed', 'Refund Initiated'],
//       'Return Rejected': [],
//       'Return Completed': ['Refund Initiated'],
//       'Refund Initiated': ['Refund Completed'],
//       'Refund Completed': []
//     };

//     if (!validTransitions[order.currentStatus].includes(status)) {
//       return res.status(400).json({ 
//         success: false, 
//         message: `Invalid status transition from ${order.currentStatus} to ${status}` 
//       });
//     }

//     // Update order
//     order.currentStatus = status;
//     order.statusHistory.push({
//       status,
//       changedBy: req.user.id,
//       note
//     });

//     // Handle refund if order is cancelled after payment
//     if (status === 'Cancelled' && order.paymentStatus === 'Completed') {
//       order.paymentStatus = 'Refunded';
//       // Here you would integrate with payment gateway for refund
//     }

//     await order.save();

//     // TODO: Send status update notification to user

//     res.json({ 
//       success: true, 
//       order,
//       message: 'Order status updated successfully'
//     });

//   } catch (error) {
//     res.status(500).json({ 
//       success: false, 
//       message: error.message 
//     });
//   }
// };

export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }
    const user = await User.findById(order.user);

    // Validate status transition
    const validTransitions = {
      'Order Placed': ['Payment Pending', 'Cancelled'],
      'Payment Pending': ['Payment Received', 'Cancelled'],
      'Payment Received': ['Processing', 'Cancelled'],
      'Processing': ['Shipped', 'Cancelled'],
      'Shipped': ['Out for Delivery', 'Cancelled'],
      'Out for Delivery': ['Delivered', 'Cancelled'],
      'Delivered': ['Return Requested'],
      'Cancelled': [],
      'Return Requested': ['Return Approved', 'Return Rejected'],
      'Return Approved': ['Return Completed', 'Refund Initiated'],
      'Return Rejected': [],
      'Return Completed': ['Refund Initiated'],
      'Refund Initiated': ['Refund Completed'],
      'Refund Completed': []
    };

    if (!validTransitions[order.currentStatus].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: `Invalid status transition from ${order.currentStatus} to ${status}` 
      });
    }


    // Update order
    order.currentStatus = status;
    order.statusHistory.push({
      status,
      changedBy: req.user.id,
      note
    });

    if(status === 'Payment Received') {
      order.paymentStatus = 'Completed';
    }
    if(status === 'Shipped') {
      order.trackingNumber = req.body.trackingId || '';
      order.trackingCompany = req.body.courier || 'India Post';
      if(user.profile.email) {
        sendTrackingEmail(user.profile.email,user.name,order.trackingNumber,'',order.trackingCompany);
      }
    }
   
    // Handle refund if order is cancelled after payment
    if (status === 'Cancelled' && order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
      // Here you would integrate with payment gateway for refund
    }

    await order.save();

    // TODO: Send status update notification to user

    res.json({ 
      success: true, 
      order,
      message: 'Order status updated successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};


// Cancel order (user)
export const cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

   

    // Check if order can be cancelled
    if (!['Order Placed', 'Payment Pending', 'Payment Received'].includes(order.currentStatus)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Order cannot be cancelled at this stage' 
      });
    }

    // Update order
    order.currentStatus = 'Cancelled';
    order.statusHistory.push({
      status: 'Cancelled',
      note: 'Cancelled by customer'
    });

    if (order.paymentStatus === 'Completed') {
      order.paymentStatus = 'Refunded';
      // Initiate refund process
    }

    await order.save();

    // Restore product stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity, sold: -item.quantity }
      });
    }

    // TODO: Send cancellation notification

    res.json({ 
      success: true, 
      message: 'Order cancelled successfully' 
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Get orders by user
export const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const filter = { user: req.user.id };
    if (status) filter.currentStatus = status;

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('items.product', 'name price images')
      .populate('shippingAddress');

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      limit: Number(limit),
      orders
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

// Add tracking information (admin)
export const addTrackingInfo = async (req, res) => {
  try {
    const { trackingNumber, trackingCompany, trackingUrl } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        trackingNumber,
        trackingCompany,
        trackingUrl,
        currentStatus: 'Shipped'
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    order.statusHistory.push({
      status: 'Shipped',
      changedBy: req.user.id,
      note: 'Tracking information added'
    });

    await order.save();

    // TODO: Send shipping notification with tracking info

    res.json({ 
      success: true, 
      order,
      message: 'Tracking information added successfully'
    });

  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};

export const getAllOrdersNoPagination = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate('user')
      .populate('shippingAddress')
      .populate('billingAddress')
      .populate('items.product');

    res.json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserOrdersNoPagination = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product');

    res.json({
      success: true,
      total: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// import os from 'os';
// import fs from 'fs';

// export const receiptTemplate = (order) => {
//   // Debug: Log what we're receiving
//   console.log('receiptTemplate called with:', {
//     hasOrder: !!order,
//     orderKeys: order ? Object.keys(order) : [],
//     hasItems: !!(order && order.items),
//     itemsLength: order && order.items ? order.items.length : 0
//   });

//   // Fallback for testing - create a simple receipt if order data is missing
//   if (!order) {
//     return `
//     <!DOCTYPE html>
//     <html>
//     <head><meta charset="utf-8"><title>Test Receipt</title></head>
//     <body style="font-family: Arial, sans-serif; padding: 20px;">
//       <h1>Test Receipt</h1>
//       <p>Order data not found</p>
//     </body>
//     </html>
//     `;
//   }

//   return `
//   <!DOCTYPE html>
//   <html>
//   <head>
//     <meta charset="utf-8">
//     <title>Invoice - ${order.orderId || order._id || 'Unknown'}</title>
//     <style>
//       body {
//         font-family: "Segoe UI", Arial, sans-serif;
//         padding: 40px;
//         color: #333;
//         background: #f9f9f9;
//         margin: 0;
//       }
//       .container {
//         max-width: 800px;
//         margin: auto;
//         background: #fff;
//         padding: 30px;
//         border-radius: 12px;
//         box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//       }
//       .header {
//         border-bottom: 2px solid #444;
//         padding-bottom: 10px;
//         margin-bottom: 25px;
//         text-align: center;
//       }
//       .header h1 {
//         margin: 0;
//         font-size: 28px;
//         color: #222;
//       }
//       .header p {
//         margin: 4px 0;
//         font-size: 13px;
//         color: #555;
//       }
//       h2 {
//         text-align: center;
//         margin: 20px 0;
//         font-size: 20px;
//         color: #111;
//       }
//       .section {
//         margin-bottom: 20px;
//       }
//       .section h3 {
//         font-size: 16px;
//         border-bottom: 1px solid #ddd;
//         padding-bottom: 5px;
//         margin-bottom: 10px;
//         color: #333;
//       }
//       .info div, .shipping div {
//         margin: 3px 0;
//         font-size: 14px;
//       }
//       table {
//         width: 100%;
//         border-collapse: collapse;
//         margin-top: 15px;
//       }
//       table th, table td {
//         border: 1px solid #ddd;
//         padding: 10px;
//         font-size: 14px;
//       }
//       table th {
//         background: #f1f1f1;
//         text-align: center;
//       }
//       table tbody tr:nth-child(even) {
//         background: #fafafa;
//       }
//       .total {
//         text-align: right;
//         margin-top: 25px;
//         font-size: 15px;
//       }
//       .total div {
//         margin: 4px 0;
//       }
//       .total b {
//         font-size: 16px;
//       }
//       .footer {
//         margin-top: 40px;
//         font-size: 12px;
//         text-align: center;
//         color: #666;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <div class="header">
//         <h1>Mbappe Arts</h1>
//         <p>VIKASH NAGAR, CHURU, Rajasthan – 331403</p>
//         <p>Email: tmbapearts@gmail.com | Phone: 9694520525</p>
//       </div>

//       <h2>Invoice</h2>

//       <div class="section info">
//         <h3>Order Information</h3>
//         <div><b>Order ID:</b> ${order.orderId || order._id || 'N/A'}</div>
//         <div><b>Order Date:</b> ${order.createdAt ? new Date(order.createdAt).toDateString() : 'N/A'}</div>
//         <div><b>Customer:</b> ${order.user?.name || order.customerName || 'N/A'}</div>
//         <div><b>Phone:</b> ${order.user?.phone || order.customerPhone || 'N/A'}</div>
//         <div><b>Payment Method:</b> ${order.paymentMethod || 'N/A'}</div>
//         <div><b>Payment Status:</b> ${order.paymentStatus || 'N/A'}</div>
//       </div>

//       <div class="section shipping">
//         <h3>Shipping Address</h3>
//         <div>${order.shippingAddress?.recipientName || order.shippingAddress?.fullName || order.shippingAddress?.name || 'N/A'}</div>
//         <div>${order.shippingAddress?.street || order.shippingAddress?.address || 'N/A'}</div>
//         <div>${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}</div>
//         <div>Pincode: ${order.shippingAddress?.postalCode || order.shippingAddress?.zip || order.shippingAddress?.zipCode || 'N/A'}</div>
//         <div>Phone: ${order.shippingAddress?.phone || 'N/A'}</div>
//         ${order.shippingAddress?.landmark ? `<div>Landmark: ${order.shippingAddress.landmark}</div>` : ''}
//       </div>

//       <table>
//         <thead>
//           <tr>
//             <th>Product</th>
//             <th>Qty</th>
//             <th>Price</th>
//             <th>Total</th>
//           </tr>
//         </thead>
//         <tbody>
//           ${order.items && Array.isArray(order.items) && order.items.length > 0 ? 
//             order.items.map(item => `
//               <tr>
//                 <td>${item.name || item.productName || item.title || 'Unknown Product'}</td>
//                 <td style="text-align:center">${item.quantity || item.qty || 0}</td>
//                 <td style="text-align:right">₹${item.price || item.unitPrice || 0}</td>
//                 <td style="text-align:right">₹${((item.price || item.unitPrice || 0) * (item.quantity || item.qty || 0)).toFixed(2)}</td>
//               </tr>
//             `).join("") : 
//             '<tr><td colspan="4" style="text-align:center">No items found</td></tr>'
//           }
//         </tbody>
//       </table>

//       <div class="total">
//         <div>Subtotal: ₹${(order.subtotal || order.subTotal || 0).toFixed ? (order.subtotal || order.subTotal || 0).toFixed(2) : (order.subtotal || order.subTotal || 0)}</div>
//         ${order.shippingFee || order.shippingCost ? `<div>Shipping Fee: ₹${(order.shippingFee || order.shippingCost).toFixed ? (order.shippingFee || order.shippingCost).toFixed(2) : (order.shippingFee || order.shippingCost)}</div>` : ""}
//         ${order.tax || order.taxAmount ? `<div>Tax: ₹${(order.tax || order.taxAmount).toFixed ? (order.tax || order.taxAmount).toFixed(2) : (order.tax || order.taxAmount)}</div>` : ""}
//         ${order.discount || order.discountAmount ? `<div>Discount: -₹${(order.discount || order.discountAmount).toFixed ? (order.discount || order.discountAmount).toFixed(2) : (order.discount || order.discountAmount)}</div>` : ""}
//         <div><b>Total: ₹${(order.total || order.totalAmount || 0).toFixed ? (order.total || order.totalAmount || 0).toFixed(2) : (order.total || order.totalAmount || 0)}</b></div>
//       </div>

//       <div class="footer">
//         <p>Thank you for shopping with Mbappe Arts!</p>
//         <p>This is a system generated receipt.</p>
//       </div>
//     </div>
//   </body>
//   </html>
//   `;
// };

// // Function to dynamically find Chrome executable path based on OS
// const getChromePath = () => {
//   const platform = os.platform();
  
//   if (platform === 'win32') {
//     // Windows paths
//     const winPaths = [
//       'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
//       'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
//       process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
//     ];
//     for (const path of winPaths) {
//       if (path && fs.existsSync(path)) {
//         return path;
//       }
//     }
//   } else if (platform === 'darwin') {
//     // macOS paths
//     const macPaths = [
//       '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
//       '/Applications/Chromium.app/Contents/MacOS/Chromium'
//     ];
//     for (const path of macPaths) {
//       if (fs.existsSync(path)) {
//         return path;
//       }
//     }
//   } else {
//     // Linux paths
//     const linuxPaths = [
//       '/usr/bin/google-chrome-stable',
//       '/usr/bin/google-chrome',
//       '/usr/bin/chromium-browser',
//       '/usr/bin/chromium',
//       '/snap/bin/chromium'
//     ];
//     for (const path of linuxPaths) {
//       if (fs.existsSync(path)) {
//         return path;
//       }
//     }
//   }
//   return null;
// };

// export const downloadReceipt = async (req, res) => {
//   let browser;
//   try {
//     console.log('Finding order with ID:', req.params.id);
    
//     const orderDoc = await Order.findById(req.params.id)
//       .populate("user", "name phone")
//       .populate("shippingAddress");

//     if (!orderDoc) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     // Convert Mongoose document to plain object
//     const order = orderDoc.toObject();
    
//     console.log('Raw order found:', JSON.stringify(order, null, 2));

//     // Debug: Log order data to see what's being passed to template
//     console.log('Order data structure:', {
//       _id: order._id,
//       orderId: order.orderId,
//       items: order.items,
//       user: order.user,
//       shippingAddress: order.shippingAddress,
//       total: order.total,
//       subtotal: order.subtotal,
//       paymentMethod: order.paymentMethod,
//       paymentStatus: order.paymentStatus,
//       createdAt: order.createdAt
//     });

//     // Test the HTML generation
//     const testHtml = receiptTemplate(order);
//     console.log('Generated HTML (first 1000 chars):', testHtml.substring(0, 1000));
//     console.log('Generated HTML (last 500 chars):', testHtml.substring(testHtml.length - 500));

//     // Get Chrome path dynamically or fallback to bundled Chromium
//     const executablePath = getChromePath();
//     console.log('Chrome path:', executablePath);
    
//     const launchOptions = {
//       headless: 'new', // Use new headless mode
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-gpu',
//         '--disable-web-security',
//         '--disable-features=VizDisplayCompositor'
//       ]
//     };

//     // Only set executablePath if we found Chrome, otherwise let Puppeteer use bundled Chromium
//     if (executablePath) {
//       launchOptions.executablePath = executablePath;
//     }

//     console.log('Launching browser...');
//     browser = await puppeteer.launch(launchOptions);

//     const page = await browser.newPage();
    
//     // Set viewport for consistent rendering
//     await page.setViewport({ width: 1200, height: 800 });
    
//     const html = receiptTemplate(order);
    
//     // Debug: Write HTML to file for inspection (optional)
//     if (process.env.NODE_ENV === 'development') {
//       const fs = await import('fs');
//       fs.writeFileSync('/tmp/debug-receipt.html', html);
//       console.log('Debug HTML written to /tmp/debug-receipt.html');
//     }

//     await page.setContent(html, { 
//       waitUntil: ["networkidle0", "domcontentloaded"],
//       timeout: 30000 
//     });

//     // Wait for content to be fully rendered
//     await page.evaluate(() => {
//       return new Promise((resolve) => {
//         if (document.readyState === 'complete') {
//           resolve();
//         } else {
//           window.addEventListener('load', resolve);
//         }
//       });
//     });

//     // Debug: Check page content
//     const pageContent = await page.content();
//     console.log('Page content length after setting:', pageContent.length);
//     console.log('Page title:', await page.title());
    
//     // Check if main elements exist
//     const containerExists = await page.$('.container');
//     const tableExists = await page.$('table');
//     console.log('Container element exists:', !!containerExists);
//     console.log('Table element exists:', !!tableExists);

//     console.log('Generating PDF...');
//     const pdfBuffer = await page.pdf({ 
//       format: "A4", 
//       printBackground: true,
//       margin: {
//         top: '20px',
//         bottom: '20px',
//         left: '20px',
//         right: '20px'
//       }
//     });

//     console.log('PDF generated, size:', pdfBuffer.length, 'bytes');
//     await browser.close();

//     // Check if response headers have already been sent
//     if (res.headersSent) {
//       console.error('Headers already sent, cannot send PDF');
//       return;
//     }

//     // Set headers before sending response
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader("Content-Length", pdfBuffer.length);
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=receipt-${order.orderId || order._id}.pdf`
//     );
//     res.setHeader("Cache-Control", "no-cache");

//     console.log('Sending PDF response...');
//     res.status(200);
//     res.end(pdfBuffer, 'binary');
//     console.log('PDF response sent successfully');
//   } catch (err) {
//     console.error('Receipt generation error:', err);
    
//     // Ensure browser is closed even on error
//     if (browser) {
//       try {
//         await browser.close();
//       } catch (closeErr) {
//         console.error('Error closing browser:', closeErr);
//       }
//     }
    
//     res.status(500).json({ 
//       message: "Error generating receipt",
//       error: process.env.NODE_ENV === 'development' ? err.message : undefined
//     });
//   }
// };


// export const downloadReceipt = async (req, res) => {
//   try {
//     const order = await Order.findById(req.params.id)
//       .populate("user", "name phone")
//       .populate("shippingAddress");

//     if (!order) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const browser = await puppeteer.launch({
//       headless: true,
//       executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // path to Chrome on Windows
//     });

//     const page = await browser.newPage();
//     const html = receiptTemplate(order);

//     await page.setContent(html, { waitUntil: "networkidle0" });

//     const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
//     await browser.close();

//     // ✅ Must set headers before sending
//     res.setHeader("Content-Type", "application/pdf");
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=receipt-${order.orderId}.pdf`
//     );

//     res.end(pdfBuffer); // ✅ Send buffer as response
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error generating receipt" });
//   }
// };

// import PDFDocument from 'pdfkit';
// import fs from 'fs';
// import path from 'path';

// export const downloadReceipt = async (req, res) => {
//   try {
//     const orderDoc = await Order.findById(req.params.id)
//       .populate("user", "name phone")
//       .populate("shippingAddress");

//     if (!orderDoc) {
//       return res.status(404).json({ message: "Order not found" });
//     }

//     const order = orderDoc.toObject();

//     // Create a new PDF document
//     const doc = new PDFDocument({ margin: 50 });
    
//     // Set response headers
//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader('Content-Disposition', `attachment; filename=receipt-${order.orderId}.pdf`);

//     // Pipe the PDF to the response
//     doc.pipe(res);

//     // Add company header
//     doc.fontSize(24).font('Helvetica-Bold').text('Mbappe Arts', 50, 50);
//     doc.fontSize(10).font('Helvetica')
//        .text('VIKASH NAGAR, CHURU, Rajasthan – 331403', 50, 80)
//        .text('Email: tmbapearts@gmail.com | Phone: 9694520525', 50, 95);

//     // Add a line
//     doc.moveTo(50, 110).lineTo(550, 110).stroke();

//     // Invoice title
//     doc.fontSize(18).font('Helvetica-Bold').text('INVOICE', 50, 130);

//     // Order information
//     let yPosition = 160;
//     doc.fontSize(12).font('Helvetica-Bold').text('Order Information:', 50, yPosition);
//     yPosition += 20;

//     doc.fontSize(10).font('Helvetica')
//        .text(`Order ID: ${order.orderId}`, 50, yPosition)
//        .text(`Order Date: ${new Date(order.createdAt).toDateString()}`, 300, yPosition);
//     yPosition += 15;

//     doc.text(`Customer: ${order.user?.name || 'N/A'}`, 50, yPosition)
//        .text(`Phone: ${order.user?.phone || 'N/A'}`, 300, yPosition);
//     yPosition += 15;

//     doc.text(`Payment Method: ${order.paymentMethod}`, 50, yPosition)
//        .text(`Payment Status: ${order.paymentStatus}`, 300, yPosition);
//     yPosition += 30;

//     // Shipping Address
//     doc.fontSize(12).font('Helvetica-Bold').text('Shipping Address:', 50, yPosition);
//     yPosition += 20;

//     doc.fontSize(10).font('Helvetica')
//        .text(`${order.shippingAddress?.recipientName || 'N/A'}`, 50, yPosition);
//     yPosition += 15;
    
//     doc.text(`${order.shippingAddress?.street || 'N/A'}`, 50, yPosition);
//     yPosition += 15;
    
//     doc.text(`${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}`, 50, yPosition);
//     yPosition += 15;
    
//     doc.text(`Pincode: ${order.shippingAddress?.postalCode || 'N/A'}`, 50, yPosition)
//        .text(`Phone: ${order.shippingAddress?.phone || 'N/A'}`, 300, yPosition);
//     yPosition += 30;

//     // Items table header
//     doc.fontSize(12).font('Helvetica-Bold').text('Items:', 50, yPosition);
//     yPosition += 20;

//     // Table headers
//     doc.fontSize(10).font('Helvetica-Bold')
//        .text('Product', 50, yPosition)
//        .text('Qty', 300, yPosition)
//        .text('Price', 350, yPosition)
//        .text('Total', 450, yPosition);
//     yPosition += 15;

//     // Draw line under headers
//     doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
//     yPosition += 10;

//     // Items
//     doc.font('Helvetica');
//     order.items.forEach(item => {
//       doc.text(item.name || 'Unknown Product', 50, yPosition)
//          .text(item.quantity?.toString() || '0', 300, yPosition)
//          .text(`₹${item.price || 0}`, 350, yPosition)
//          .text(`₹${(item.price || 0) * (item.quantity || 0)}`, 450, yPosition);
//       yPosition += 15;
//     });

//     // Total section
//     yPosition += 20;
//     doc.moveTo(350, yPosition).lineTo(550, yPosition).stroke();
//     yPosition += 10;

//     doc.text(`Subtotal: ₹${order.subtotal || 0}`, 350, yPosition);
//     yPosition += 15;

//     if (order.shippingFee) {
//       doc.text(`Shipping Fee: ₹${order.shippingFee}`, 350, yPosition);
//       yPosition += 15;
//     }

//     if (order.tax) {
//       doc.text(`Tax: ₹${order.tax}`, 350, yPosition);
//       yPosition += 15;
//     }

//     if (order.discount) {
//       doc.text(`Discount: -₹${order.discount}`, 350, yPosition);
//       yPosition += 15;
//     }

//     doc.fontSize(12).font('Helvetica-Bold')
//        .text(`Total: ₹${order.total || 0}`, 350, yPosition);

//     // Footer
//     yPosition += 50;
//     doc.fontSize(10).font('Helvetica')
//        .text('Thank you for shopping with Mbappe Arts!', 50, yPosition, { align: 'center' });

//     // Finalize the PDF
//     doc.end();

//   } catch (error) {
//     console.error('Receipt generation error:', error);
//     res.status(500).json({ 
//       message: "Error generating receipt",
//       error: process.env.NODE_ENV === 'development' ? error.message : undefined
//     });
//   }
// };


// Modern Receipt Generator using Puppeteer
// Install: npm install puppeteer




import chromium from '@sparticuz/chromium'; // For serverless environments


// Enhanced HTML template (unchanged from your version)
const createReceiptHTML = (order) => {
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return `₹${(parseFloat(amount) || 0).toFixed(2)}`;
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${order.orderId || order._id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 14px;
          line-height: 1.6;
          color: #333;
          background: #fff;
          padding: 20px;
          width: 100%;
        }
        
        .container {
          max-width: 800px;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
        }
        
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #2c3e50;
          padding-bottom: 20px;
        }
        
        .header h1 {
          font-size: 28px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        
        .header p {
          font-size: 12px;
          color: #666;
          margin: 3px 0;
        }
        
        .invoice-title {
          text-align: center;
          font-size: 24px;
          font-weight: bold;
          margin: 20px 0;
          color: #e74c3c;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .section {
          margin-bottom: 30px;
        }
        
        .section-title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 15px;
          color: #2c3e50;
          border-bottom: 2px solid #3498db;
          padding-bottom: 5px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
        }
        
        .info-row {
          margin-bottom: 8px;
          display: flex;
        }
        
        .info-label {
          font-weight: bold;
          color: #555;
          min-width: 140px;
        }
        
        .info-value {
          color: #333;
          flex: 1;
        }
        
        .shipping-address {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #3498db;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .items-table th {
          background: linear-gradient(135deg, #3498db, #2980b9);
          color: white;
          padding: 15px 10px;
          text-align: center;
          font-weight: bold;
          font-size: 13px;
        }
        
        .items-table td {
          padding: 12px 10px;
          border-bottom: 1px solid #ecf0f1;
          font-size: 12px;
        }
        
        .items-table tbody tr:hover {
          background: #f8f9fa;
        }
        
        .items-table .text-center {
          text-align: center;
        }
        
        .items-table .text-right {
          text-align: right;
          font-weight: bold;
        }
        
        .totals {
          margin-top: 30px;
          float: right;
          width: 350px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          padding: 8px 0;
        }
        
        .total-label {
          font-weight: 600;
          color: #555;
        }
        
        .total-value {
          font-weight: bold;
          color: #333;
        }
        
        .final-total {
          border-top: 2px solid #e74c3c;
          margin-top: 15px;
          padding-top: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #e74c3c;
        }
        
        .footer {
          clear: both;
          text-align: center;
          margin-top: 60px;
          padding: 20px;
          background: #2c3e50;
          color: white;
          border-radius: 8px;
        }
        
        .footer p {
          margin: 5px 0;
        }
        
        .footer strong {
          color: #f39c12;
        }
        
        @media print {
          body { padding: 0; }
          .container { max-width: none; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎨 Mbappe Arts</h1>
          <p>VIKASH NAGAR, CHURU, Rajasthan – 331403</p>
          <p>Email: tmbapearts@gmail.com | Phone: 9694520525</p>
        </div>
        
        <div class="invoice-title">📋 INVOICE</div>
        
        <div class="info-grid">
          <div class="section">
            <div class="section-title">📋 Order Information</div>
            <div class="info-row">
              <div class="info-label">Order ID:</div>
              <div class="info-value">${order.orderId || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Order Date:</div>
              <div class="info-value">${formatDate(order.createdAt)}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Payment Method:</div>
              <div class="info-value">${order.paymentMethod || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Payment Status:</div>
              <div class="info-value">${order.paymentStatus || 'N/A'}</div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">👤 Customer Information</div>
            <div class="info-row">
              <div class="info-label">Customer:</div>
              <div class="info-value">${order.user?.name || 'N/A'}</div>
            </div>
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value">${order.user?.phone || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">🚚 Shipping Address</div>
          <div class="shipping-address">
            <strong>${order.shippingAddress?.recipientName || 'N/A'}</strong><br>
            ${order.shippingAddress?.street || 'N/A'}<br>
            ${order.shippingAddress?.city || 'N/A'}, ${order.shippingAddress?.state || 'N/A'}<br>
            Pincode: ${order.shippingAddress?.postalCode || 'N/A'}<br>
            Phone: ${order.shippingAddress?.phone || 'N/A'}
            ${order.shippingAddress?.landmark ? `<br>Landmark: ${order.shippingAddress.landmark}` : ''}
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">🛍️ Items Ordered</div>
          <table class="items-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Size</th>
                <th>Color</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items && order.items.length > 0 ? 
                order.items.map(item => {
                  const qty = parseInt(item.quantity) || 0;
                  const price = parseFloat(item.price) || 0;
                  const total = qty * price;
                  
                  return `
                    <tr>
                      <td><strong>${item.name || 'Unknown Product'}</strong></td>
                      <td class="text-center">${item.size || 'N/A'}</td>
                      <td class="text-center">${item.color || 'N/A'}</td>
                      <td class="text-center">${qty}</td>
                      <td class="text-right">${formatCurrency(price)}</td>
                      <td class="text-right">${formatCurrency(total)}</td>
                    </tr>
                  `;
                }).join('') : 
                '<tr><td colspan="6" class="text-center"><em>No items found</em></td></tr>'
              }
            </tbody>
          </table>
        </div>
        
        <div class="totals">
          <div class="total-row">
            <span class="total-label">Subtotal:</span>
            <span class="total-value">${formatCurrency(order.subtotal)}</span>
          </div>
          ${order.shippingFee && parseFloat(order.shippingFee) > 0 ? `
          <div class="total-row">
            <span class="total-label">Shipping Fee:</span>
            <span class="total-value">${formatCurrency(order.shippingFee)}</span>
          </div>
          ` : ''}
          ${order.tax && parseFloat(order.tax) > 0 ? `
          <div class="total-row">
            <span class="total-label">Tax:</span>
            <span class="total-value">${formatCurrency(order.tax)}</span>
          </div>
          ` : ''}
          ${order.discount && parseFloat(order.discount) > 0 ? `
          <div class="total-row">
            <span class="total-label">Discount:</span>
            <span class="total-value">-${formatCurrency(order.discount)}</span>
          </div>
          ` : ''}
          <div class="total-row final-total">
            <span class="total-label">💰 TOTAL AMOUNT:</span>
            <span class="total-value">${formatCurrency(order.total)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>🙏 Thank you for shopping with Mbappe Arts!</strong></p>
          <p>This is a computer generated receipt.</p>
          <p>For queries: tmbapearts@gmail.com | 📞 9694520525</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// FIXED PUPPETEER IMPLEMENTATION
export const downloadReceipt = async (req, res) => {
  let browser = null;
  const startTime = Date.now();
  
  try {
    console.log(`[${new Date().toISOString()}] Starting receipt generation for order: ${req.params.id}`);
    
    // Fetch order data
    const orderDoc = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("shippingAddress");

    if (!orderDoc) {
      console.log(`[${new Date().toISOString()}] Order not found: ${req.params.id}`);
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderDoc.toObject();
    console.log(`[${new Date().toISOString()}] Order data loaded successfully`);

    // Generate HTML
    const html = createReceiptHTML(order);
    console.log(`[${new Date().toISOString()}] HTML template generated`);

    // Determine if running in serverless/cloud environment
    const isServerless = process.env.RENDER || process.env.VERCEL || process.env.NETLIFY;
    
    let launchOptions;
    
    if (isServerless) {
      // For serverless environments (Render, Vercel, etc.)
      launchOptions = {
        args: [
          ...chromium.args,
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu',
          '--single-process',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      };
    } else {
      // For local development
      launchOptions = {
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      };
    }

    console.log(`[${new Date().toISOString()}] Launching browser with ${isServerless ? 'serverless' : 'local'} config`);
    
    // Launch Puppeteer
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({
      width: 1200,
      height: 800,
      deviceScaleFactor: 1
    });
    
    // Set content and wait for load with increased timeout
    await page.setContent(html, { 
      waitUntil: 'networkidle2', // Changed from networkidle0 for better reliability
      timeout: 60000 // Increased timeout
    });

    // Wait a bit more to ensure everything is rendered
    await page.waitForTimeout(2000);

    console.log(`[${new Date().toISOString()}] Creating PDF...`);

    // Generate PDF with optimized settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      timeout: 60000 // Add timeout for PDF generation
    });

    await browser.close();
    browser = null;

    const generationTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] PDF generated successfully. Size: ${pdfBuffer.length} bytes, Time: ${generationTime}ms`);

    // Validate PDF buffer
    if (!pdfBuffer || pdfBuffer.length < 1000) {
      throw new Error(`Generated PDF seems too small: ${pdfBuffer ? pdfBuffer.length : 0} bytes`);
    }

    // Set headers and send PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.orderId || order._id}.pdf"`);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.status(200).end(pdfBuffer);
    console.log(`[${new Date().toISOString()}] PDF sent successfully`);

  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error(`[${new Date().toISOString()}] Receipt generation error after ${generationTime}ms:`, error);
    
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.error('Error closing browser:', closeError);
      }
    }
    
    // Try fallback method
    console.log('Attempting fallback method...');
    return downloadReceiptFallback(req, res);
  }
};

// APPROACH 2: HTML-to-PDF using html-pdf-node (Lightweight Alternative)
import htmlPdf from 'html-pdf-node';

export const downloadReceiptHTMLPDF = async (req, res) => {
  try {
    console.log(`[${new Date().toISOString()}] Starting HTML-PDF receipt generation for order: ${req.params.id}`);
    
    const orderDoc = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("shippingAddress");

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderDoc.toObject();
    const html = createReceiptHTML(order);

    const options = {
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      timeout: 30000
    };

    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    console.log(`[${new Date().toISOString()}] HTML-PDF generated successfully. Size: ${pdfBuffer.length} bytes`);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Content-Disposition', `attachment; filename="receipt-${order.orderId || order._id}.pdf"`);
    
    res.status(200).end(pdfBuffer);

  } catch (error) {
    console.error('HTML-PDF generation error:', error);
    return downloadReceiptFallback(req, res);
  }
};

// APPROACH 3: Enhanced Fallback Method (Returns styled HTML)
export const downloadReceiptFallback = async (req, res) => {
  try {
    console.log('Using enhanced fallback method for receipt generation');
    
    const orderDoc = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("shippingAddress");

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderDoc.toObject();
    const html = createReceiptHTML(order);

    // Add print-specific CSS and auto-print JavaScript
    const enhancedHtml = html.replace('</head>', `
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .container { max-width: none; box-shadow: none; }
          .no-print { display: none; }
        }
      </style>
      <script>
        window.onload = function() {
          // Auto-print when page loads
          setTimeout(function() {
            window.print();
          }, 1000);
        };
      </script>
    </head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="receipt-${order.orderId || order._id}.html"`);
    res.status(200).send(enhancedHtml);

  } catch (error) {
    console.error('Fallback receipt generation error:', error);
    res.status(500).json({ 
      message: "Error generating receipt",
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// APPROACH 4: jsPDF Implementation (Client-side PDF generation)
export const downloadReceiptJSPDF = async (req, res) => {
  try {
    console.log('Using jsPDF method - returning data for client-side generation');
    
    const orderDoc = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("shippingAddress");

    if (!orderDoc) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orderDoc.toObject();
    
    // Return order data for client-side PDF generation
    res.status(200).json({
      success: true,
      message: "Order data retrieved successfully",
      data: order,
      generateOnClient: true
    });

  } catch (error) {
    console.error('jsPDF data preparation error:', error);
    res.status(500).json({ message: "Error preparing receipt data" });
  }
};


