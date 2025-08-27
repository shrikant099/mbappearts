import nodemailer from "nodemailer";

// --- Utility to send tracking email ---
export async function sendTrackingEmail(email, name, trackingId, message, courierParam) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    }
  });

  let courier = courierParam || "";
  let tracking = trackingId;

  if (!courier) {
    try {
      const msgObj = JSON.parse(message);
      courier = msgObj.courier || "";
      tracking = msgObj.trackingId || trackingId;
    } catch {
      // Ignore invalid JSON
    }
  }

  const courierDisplay = courier && courier.trim() !== "" ? courier : "";

  const emailMessage = `
  Hello ${name || 'Customer'},

  We’re happy to inform you that your beautiful furniture piece from Mbappe Arts has been dispatched!

  Courier Service: ${courierDisplay}
  Tracking ID: ${tracking}

  You can expect your delivery soon. Thank you for shopping with us!

  Warm regards,  
  Mbappe Arts Team
  `;

  const mailOptions = {
    from: `Mbappe Arts <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🪑 Your Mbappe Arts Order is on the Way!`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f4f4f4; padding: 32px;">
        <div style="max-width: 480px; margin: auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background: #d4a373; padding: 24px 0; text-align: center;">
            <img src="https://i.ibb.co/6b7n6k2/aravali-logo.png" alt="Mbappe Arts" style="height: 48px; margin-bottom: 8px;"/>
            <h2 style="color: #fff; margin: 0; font-size: 1.6rem;">🪑 Furniture Dispatched</h2>
          </div>
          <div style="padding: 28px 32px 24px 32px; color: #333;">
            <p style="font-size: 1.1rem;">Dear <b>${name || 'Customer'}</b>,</p>
            <div style="background: #f9f9f9; border-left: 4px solid #d4a373; padding: 16px; border-radius: 6px; margin-bottom: 18px;">
              <span style="font-size: 1rem;">${emailMessage.replace(/\n/g, '<br/>')}</span>
            </div>
            <p style="font-size: 0.95rem;">Thank you for choosing Mbappe Arts – bringing timeless furniture to your space.</p>
            <div style="text-align: center; margin-top: 24px;">
              <a href="https://mbappearts.com" style="display: inline-block; background: #d4a373; color: #fff; text-decoration: none; padding: 10px 28px; border-radius: 5px; font-weight: 600;">Visit Our Website</a>
            </div>
          </div>
        </div>
        <div style="text-align: center; color: #999; font-size: 0.9rem; margin-top: 18px;">
          &copy; ${new Date().getFullYear()} Mbappe Arts | 📧 tmbapearts@gmail.com | 📞 9694520525
        </div>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}



// --- Utility to send order confirmation email ---
export async function sendOrderConfirmationEmail(data) {
  const { email, fullName, orderId, items, shippingCharges, totalAmount, shippingInfo } = data;

  if (!email || !fullName || !orderId || !items || !totalAmount || !shippingInfo) {
      throw new Error("Missing required fields in email data");
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    }
  });

  const itemsRows = items.map(item => `
    <tr style="border-bottom: 1px solid #ccc;">
      <td style="padding: 8px;">${item.title}</td>
      <td style="padding: 8px;">${item.quantity}</td>
      <td style="padding: 8px;">₹${item.netPrice}</td>
    </tr>
  `).join("");

  const emailHtml = `
  <div style="font-family: 'Segoe UI', sans-serif; background-color: #fff8f0; color: #333; padding: 30px; border-radius: 8px; max-width: 600px; margin: auto;">
    <h2 style="color: #8a4b2f; text-align: center;">🧾 Order Confirmation – Mbappe Arts</h2>
    <p>Hello <b>${fullName}</b>,</p>
    <p>Thank you for choosing Mbappe Arts. Your order has been confirmed and is being prepared for delivery.</p>

    <h3 style="color: #8a4b2f;">Order ID: #${orderId}</h3>

    <p>Here’s a breakdown of your furniture purchase:</p>
    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
      <thead>
        <tr style="background-color: #d4a373; color: #fff;">
          <th style="padding: 10px;">Item</th>
          <th style="padding: 10px;">Qty</th>
          <th style="padding: 10px;">Price</th>
        </tr>
      </thead>
      <tbody style="color: #333;">
        ${itemsRows}
        <tr>
          <td style="padding: 8px;">Shipping Charges</td>
          <td style="padding: 8px;">–</td>
          <td style="padding: 8px;">₹${shippingCharges}</td>
        </tr>
        <tr style="font-weight: bold;">
          <td colspan="2" style="padding: 8px;">Total Amount</td>
          <td style="padding: 8px;">₹${totalAmount}</td>
        </tr>
      </tbody>
    </table>

    <h3 style="margin-top: 20px;">📦 Shipping Info</h3>
    <p>Name: ${shippingInfo.fullName}</p>
    <p>Address:</p>
    <p>
      Floor No.: GROUND FLOOR<br/>
      Building No.: PLOT NO 75<br/>
      Premises: POST UDSAR LODERA TEH SARDARSHAHAR<br/>
      Road: VIKASH NAGAR VILLAGE BHOLUSAR<br/>
      City: Bholoosar, Churu, Rajasthan – 331403<br/>
      Mobile: 9694520525
    </p>

    <p style="margin-top: 20px;">We will notify you once your furniture is out for delivery with tracking details.</p>
    <p>We appreciate your business and hope our furniture brings elegance to your space 🛋️</p>

    <p style="margin-top: 30px;">Warm regards,<br><b>Team Mbappe Arts</b></p>
    <p><a href="https://mbappearts.com" style="color: #d4a373;">Visit Our Website</a></p>
  </div>
  `;

  const mailOptions = {
    from: `Mbappe Arts <${process.env.MAIL_USER}>`,
    to: email,
    subject: `🪑 Order Confirmed | Mbappe Arts #${orderId}`,
    html: emailHtml
  };

  await transporter.sendMail(mailOptions);
}
