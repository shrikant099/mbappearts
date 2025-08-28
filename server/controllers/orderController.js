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


export const receiptTemplate = (order) => {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body {
        font-family: "Segoe UI", Arial, sans-serif;
        padding: 40px;
        color: #333;
        background: #f9f9f9;
      }
      .container {
        max-width: 800px;
        margin: auto;
        background: #fff;
        padding: 30px;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      .header {
        border-bottom: 2px solid #444;
        padding-bottom: 10px;
        margin-bottom: 25px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 28px;
        color: #222;
      }
      .header p {
        margin: 4px 0;
        font-size: 13px;
        color: #555;
      }
      h2 {
        text-align: center;
        margin: 20px 0;
        font-size: 20px;
        color: #111;
      }
      .section {
        margin-bottom: 20px;
      }
      .section h3 {
        font-size: 16px;
        border-bottom: 1px solid #ddd;
        padding-bottom: 5px;
        margin-bottom: 10px;
        color: #333;
      }
      .info div, .shipping div {
        margin: 3px 0;
        font-size: 14px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }
      table th, table td {
        border: 1px solid #ddd;
        padding: 10px;
        font-size: 14px;
      }
      table th {
        background: #f1f1f1;
        text-align: center;
      }
      table tbody tr:nth-child(even) {
        background: #fafafa;
      }
      .total {
        text-align: right;
        margin-top: 25px;
        font-size: 15px;
      }
      .total div {
        margin: 4px 0;
      }
      .total b {
        font-size: 16px;
      }
      .footer {
        margin-top: 40px;
        font-size: 12px;
        text-align: center;
        color: #666;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Mbappe Arts</h1>
        <p>VIKASH NAGAR, CHURU, Rajasthan – 331403</p>
        <p>Email: tmbapearts@gmail.com | Phone: 9694520525</p>
      </div>

      <h2>Invoice</h2>

      <div class="section info">
        <h3>Order Information</h3>
        <div><b>Order ID:</b> ${order.orderId}</div>
        <div><b>Order Date:</b> ${new Date(order.createdAt).toDateString()}</div>
        <div><b>Customer:</b> ${order.user?.name || ""}</div>
        <div><b>Phone:</b> ${order.user?.phone || ""}</div>
        <div><b>Payment Method:</b> ${order.paymentMethod}</div>
        <div><b>Payment Status:</b> ${order.paymentStatus}</div>
      </div>

      <div class="section shipping">
        <h3>Shipping Address</h3>
        <div>${order.shippingAddress?.fullName || ""}</div>
        <div>${order.shippingAddress?.street || ""}</div>
        <div>${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""}</div>
        <div>Pincode: ${order.shippingAddress?.zip || ""}</div>
        <div>Phone: ${order.shippingAddress?.phone || ""}</div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(item => `
            <tr>
              <td>${item.name}</td>
              <td style="text-align:center">${item.quantity}</td>
              <td style="text-align:right">₹${item.price}</td>
              <td style="text-align:right">₹${item.price * item.quantity}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>

      <div class="total">
        <div>Subtotal: ₹${order.subtotal}</div>
        ${order.shippingFee ? `<div>Shipping Fee: ₹${order.shippingFee}</div>` : ""}
        ${order.tax ? `<div>Tax: ₹${order.tax}</div>` : ""}
        ${order.discount ? `<div>Discount: -₹${order.discount}</div>` : ""}
        <div><b>Total: ₹${order.total}</b></div>
      </div>

      <div class="footer">
        <p>Thank you for shopping with Mbappe Arts!</p>
        <p>This is a system generated receipt.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};






export const downloadReceipt = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name phone")
      .populate("shippingAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" // path to Chrome on Windows
    });

    const page = await browser.newPage();
    const html = receiptTemplate(order);

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({ format: "A4", printBackground: true });
    await browser.close();

    // ✅ Must set headers before sending
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=receipt-${order.orderId}.pdf`
    );

    res.end(pdfBuffer); // ✅ Send buffer as response
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating receipt" });
  }
};
