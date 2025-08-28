import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { apiConnector } from "../services/apiConnector";
import { endpoints, orderEndpoints } from "../services/api";
import {
  Edit3,
  Save,
  X,
  Package,
  Eye,
  XCircle,
  Calendar,
  MapPin,
  Phone,
  Mail,
  User,
  Settings,
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { Truck, Building2, Hash, ExternalLink } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { setProductData } from "../slices/productSlice";

const {printReceipt} = orderEndpoints;

// Corrected EditableField to prevent cursor jumping
const EditableField = ({
  label,
  field,
  value,
  type = "text",
  icon: Icon,
  handleSave: parentHandleSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // Manage input value locally to prevent cursor jumping
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    // Sync local state if the prop value changes from the parent
    setInputValue(value || "");
  }, [value]);

  const handleEdit = () => {
    // When editing starts, ensure the local state is up-to-date with the prop
    setInputValue(value || "");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  

  const handleSaveClick = () => {
    parentHandleSave(field, inputValue);
    setIsEditing(false);
  };

  const getDisplayValue = () => {
    if (type === "date" && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }
    }
    return value || "Not specified";
  };

  return (
    <div
      className={`group p-4 rounded-lg bg-[#1a1a1a] border border-transparent hover:border-[#ecba49]/30 transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {Icon && <Icon size={20} className="text-[#ecba49]" />}
          <div className="flex-1">
            <label className="text-sm text-gray-400 block mb-1">{label}</label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                {type === "select" ? (
                  <select
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-black border border-[#ecba49] rounded px-3 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50 transition-all duration-300 flex-1"
                    autoFocus
                  >
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  <input
                    type={type}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="bg-black border border-[#ecba49] rounded px-3 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50 transition-all duration-300 flex-1"
                    autoFocus
                  />
                )}
                <button
                  onClick={handleSaveClick}
                  className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors duration-300 hover:scale-110 active:scale-95"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-300 hover:scale-110 active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-[#ecba49] font-medium group-hover:text-yellow-300 transition-colors duration-300">
                {getDisplayValue()}
              </div>
            )}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 p-2 text-[#ecba49] hover:text-yellow-300 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

// Component for Date of Birth Dropdowns
const EditableDOBField = ({
  label,
  field,
  value,
  icon: Icon,
  handleSave: parentHandleSave,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const getInitialDate = () => {
    const date = value ? new Date(value) : null;
    if (date && !isNaN(date.getTime())) {
      return {
        day: date.getDate(),
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };
    }
    return { day: "", month: "", year: "" };
  };

  const [day, setDay] = useState(getInitialDate().day);
  const [month, setMonth] = useState(getInitialDate().month);
  const [year, setYear] = useState(getInitialDate().year);

  const handleEdit = () => {
    const { day, month, year } = getInitialDate();
    setDay(day);
    setMonth(month);
    setYear(year);
    setIsEditing(true);
  };

  const handleCancel = () => setIsEditing(false);

  const handleSaveClick = () => {
    if (day && month && year) {
      const newDate = `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
      parentHandleSave(field, newDate);
      setIsEditing(false);
    } else {
      toast.error("Please select a valid date.");
    }
  };

  const years = Array.from(
    { length: 100 },
    (_, i) => new Date().getFullYear() - i
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div
      className={`group p-4 rounded-lg bg-[#1a1a1a] border border-transparent hover:border-[#ecba49]/30 transition-all duration-300 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {Icon && <Icon size={20} className="text-[#ecba49]" />}
          <div className="flex-1">
            <label className="text-sm text-gray-400 block mb-1">{label}</label>
            {isEditing ? (
              <div className="flex items-center gap-2">
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="bg-black border border-[#ecba49] rounded px-2 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50 w-full"
                >
                  <option value="">Day</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="bg-black border border-[#ecba49] rounded px-2 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50 w-full"
                >
                  <option value="">Month</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {new Date(0, m - 1).toLocaleString("default", {
                        month: "long",
                      })}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="bg-black border border-[#ecba49] rounded px-2 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50 w-full"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleSaveClick}
                  className="p-2 bg-green-600 rounded hover:bg-green-700 transition-colors duration-300 hover:scale-110 active:scale-95"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-2 bg-red-600 rounded hover:bg-red-700 transition-colors duration-300 hover:scale-110 active:scale-95"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-[#ecba49] font-medium group-hover:text-yellow-300 transition-colors duration-300">
                {value
                  ? new Date(value).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Not specified"}
              </div>
            )}
          </div>
        </div>
        {!isEditing && (
          <button
            onClick={handleEdit}
            className="opacity-0 group-hover:opacity-100 p-2 text-[#ecba49] hover:text-yellow-300 transition-all duration-300 hover:scale-110 active:scale-95"
          >
            <Edit3 size={16} />
          </button>
        )}
      </div>
    </div>
  );
};



// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 p-4 bg-[#1a1a1a] rounded-lg border border-[#ecba49]/20">
      <div className="text-sm text-gray-400">
        Showing {startItem} to {endItem} of {totalItems} orders
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg border border-[#ecba49]/30 hover:bg-[#ecba49]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronLeft size={16} className="text-[#ecba49]" />
        </button>
        
        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`px-3 py-2 rounded-lg transition-all duration-300 ${
              page === currentPage
                ? 'bg-[#ecba49] text-black font-semibold'
                : page === '...'
                ? 'cursor-default text-gray-500'
                : 'border border-[#ecba49]/30 hover:bg-[#ecba49]/10 text-[#ecba49]'
            }`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg border border-[#ecba49]/30 hover:bg-[#ecba49]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <ChevronRight size={16} className="text-[#ecba49]" />
        </button>
      </div>
    </div>
  );
};

const Profile = () => {
  const user = useSelector((state) => state.auth.userData);
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOrders, setShowOrders] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('');

  const navigate = useNavigate();
  const dispatch = useDispatch();


  // State and ref for picture upload
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
    setTimeout(() => setIsVisible(true), 100);
  }, []);

 

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await apiConnector(
        "GET",
        `${endpoints.getProfile}${user._id}`
      );
      if (response.data.success) {
        setProfileData(response.data.user);
      }
    } catch (error) {
      console.log("error while fetching profile", error);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const token = useSelector((state) => state.auth.token);
// const receiptHandler = async (id) => {
//   try {
//     console.log(selectedOrder)
//     const res = await apiConnector(
//       "GET",
//       `${printReceipt}${id}/receipt`,
//       null,
//       {
//         headers: { Authorization: `Bearer ${token}` },
//         responseType: "blob",   // 👈 ensures raw PDF
//       }
//     );

//     const pdfBlob = new Blob([res.data], { type: "application/pdf" });
//     const pdfUrl = window.URL.createObjectURL(pdfBlob);

//     // Download
//     const link = document.createElement("a");
//     link.href = pdfUrl;
//     link.setAttribute("download", `receipt-${id}.pdf`);
//     document.body.appendChild(link);
//     link.click();
//     link.remove();

//     // OR: open in new tab
//     // window.open(pdfUrl, "_blank");
//   } catch (error) {
//     console.error(error);
//     toast.error("Unable to print receipt.");
//   }
// };



 // If using module bundler


const downloadReceiptAsPDF = (order) => {
  const createReceiptHTML = (order) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

    const formatCurrency = (amount) => `₹${(parseFloat(amount) || 0).toFixed(2)}`;

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 10px;
          }
          .container {
              width: 210mm;   /* A4 width */
              min-height: 297mm; /* A4 height */
              margin: auto;
              padding: 15mm;  /* add padding for breathing space */
              background: #fff;
              box-shadow: 0 0 3px rgba(0,0,0,0.2);
            }

          .header, .footer {
            text-align: center;
            margin-bottom: 10px;
          }
          .header h1 { font-size: 18px; color: #2c3e50; }
          .header p, .footer p { font-size: 10px; }
          .invoice-title {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            margin: 10px 0;
            color: #e74c3c;
          }
          .info-grid {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .section { width: 48%; }
          .section-title {
            font-weight: bold;
            font-size: 12px;
            color: #2c3e50;
            border-bottom: 1px solid #3498db;
            margin-bottom: 6px;
          }
          .info-row { margin-bottom: 4px; }
          .info-label { font-weight: bold; display: inline-block; width: 100px; }
          .shipping-address {
            font-size: 11px;
            background: #f2f2f2;
            padding: 8px;
            border-left: 3px solid #3498db;
            margin-bottom: 10px;
          }
         

          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 11px;
            margin-top: 10px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 6px;
            text-align: center;
          }
          th {
            background: #3498db;
            color: #fff;
            font-size: 11px;
          }
               table {
              width: 100%;
              table-layout: fixed;
            }
            th, td {
              word-wrap: break-word;
            }
          .totals {
            margin-top: 10px;
            width: 100%;
            font-size: 11px;
            float: right;
          }
          .totals .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
          }
          .final-total {
            font-size: 14px;
            font-weight: bold;
            color: #e74c3c;
            border-top: 1px solid #e74c3c;
            margin-top: 6px;
            padding-top: 6px;
          }
          @media print {
            body { zoom: 0.8; }
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
              <div class="section-title">Order Info</div>
              <div class="info-row"><span class="info-label">Order ID:</span> ${order.orderId}</div>
              <div class="info-row"><span class="info-label">Order Date:</span> ${formatDate(order.createdAt)}</div>
              <div class="info-row"><span class="info-label">Payment:</span> ${order.paymentMethod} - ${order.paymentStatus}</div>
            </div>
            <div class="section">
              <div class="section-title">Customer</div>
              <div class="info-row"><span class="info-label">Name:</span> ${order.shippingAddress?.recipientName || 'N/A'}</div>
              <div class="info-row"><span class="info-label">Phone:</span> ${order.shippingAddress?.phone || 'N/A'}</div>
            </div>
          </div>

          <div class="shipping-address">
            ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''}<br>
            Pincode: ${order.shippingAddress?.postalCode || ''} ${order.shippingAddress?.landmark ? ` | Landmark: ${order.shippingAddress.landmark}` : ''}
          </div>

          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Unit</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => {
                const qty = parseInt(item.quantity) || 0;
                const price = parseFloat(item.price) || 0;
                const total = qty * price;
                return `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.size}</td>
                    <td>${item.color}</td>
                    <td>${qty}</td>
                    <td>${formatCurrency(price)}</td>
                    <td>${formatCurrency(total)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div class="total-row"><span>Subtotal:</span><span>${formatCurrency(order.subtotal)}</span></div>
            <div class="total-row"><span>Shipping:</span><span>${formatCurrency(order.shippingFee)}</span></div>
            <div class="total-row"><span>Tax:</span><span>${formatCurrency(order.tax)}</span></div>
            ${order.discount > 0 ? `<div class="total-row"><span>Discount:</span><span>- ${formatCurrency(order.discount)}</span></div>` : ''}
            <div class="total-row final-total"><span>Total:</span><span>${formatCurrency(order.total)}</span></div>
          </div>

          <div class="footer">
            <p>🙏 Thank you for shopping with Mbappe Arts!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const html = createReceiptHTML(order);

  const wrapper = document.createElement("div");
  wrapper.innerHTML = html;
  wrapper.style.display = "none";
  document.body.appendChild(wrapper);

  const element = wrapper.querySelector(".container");

  const options = {
    margin: 0,
    filename: `receipt-${order.orderId || order._id}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      dpi: 192,
      letterRendering: true
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(options).from(element).save().then(() => {
    document.body.removeChild(wrapper);
  });
};






  // Updated fetchOrders with pagination
  const fetchOrders = async (page = 1, limit = 10, status = '') => {
    try {
      setOrdersLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      
      if (status) params.append('status', status);

      const response = await apiConnector(
        "GET",
        `${orderEndpoints.getUserOrders}?${params.toString()}`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      console.log(response);

      if (response.data.success) {
        setOrders(response.data.orders);
        setCurrentPage(response.data.page);
        setTotalPages(response.data.pages);
        setTotalOrders(response.data.total);
        setItemsPerPage(response.data.limit);
      }
    } catch (error) {
      console.log("error while fetching orders", error);
      toast.error("Failed to fetch orders");
    } finally {
      setOrdersLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchOrders(page, itemsPerPage, statusFilter);
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newLimit) => {
    setItemsPerPage(newLimit);
    setCurrentPage(1);
    fetchOrders(1, newLimit, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
    fetchOrders(1, itemsPerPage, status);
  };

  const handleSave = async (field, value) => {
    try {
      const updateData = {};
      if (field.includes("profile.")) {
        const profileField = field.replace("profile.", "");
        updateData.profile = { ...profileData.profile, [profileField]: value };
      } else {
        updateData[field] = value;
      }

      const response = await apiConnector(
        "PUT",
        `${endpoints.updateProfile}${user._id}`,
        updateData
      );

      if (response.data.success) {
        setProfileData(response.data.user);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.log("error while update profile", error);
      toast.error("Failed to update profile");
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await apiConnector(
        "PUT",
        `${orderEndpoints.cancelOrder}${orderId}/cancel`
      );
      if (response.data.success) {
        toast.success("Order cancelled successfully");
        fetchOrders(currentPage, itemsPerPage, statusFilter);
      }
    } catch (error) {
      console.log("error while cancelling", error);
      toast.error("Failed to cancel order");
    }
  };

  // Functions to handle picture upload
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("updatePicture", file);

    setImageUploadLoading(true);
    try {
      const response = await apiConnector(
        "PATCH",
        `${endpoints.updatePicture}${user._id}`,
        formData
      );
      if (response.data.success) {
        toast.success("Profile Picture Updated!");
        setProfileData(response.data.user);
      } else {
        toast.error(response.data.message || "Failed to update picture.");
      }
    } catch (error) {
      console.error("PICTURE_UPDATE_ERROR", error);
      toast.error("Could not update profile picture.");
    } finally {
      setImageUploadLoading(false);
      e.target.value = null;
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      "Order Placed": "text-blue-400 bg-blue-400/10 border-blue-400/20",
      Processing: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
      Shipped: "text-purple-400 bg-purple-400/10 border-purple-400/20",
      Delivered: "text-green-400 bg-green-400/10 border-green-400/20",
      Cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
      "Return Requested":
        "text-orange-400 bg-orange-400/10 border-orange-400/20",
    };
    return colors[status] || "text-gray-400 bg-gray-400/10 border-gray-400/20";
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // Remove local sorting since we're using pagination from backend
  const sortedOrders = orders;

  const SortButton = ({ column, children }) => (
    <button
      onClick={() => handleSort(column)}
      className="flex items-center gap-2 hover:text-yellow-300 transition-colors duration-300"
    >
      {children}
      {sortConfig.key === column ? (
        sortConfig.direction === "asc" ? (
          <ChevronUp size={16} />
        ) : (
          <ChevronDown size={16} />
        )
      ) : (
        <ChevronDown size={16} className="opacity-50" />
      )}
    </button>
  );

  // Enhanced Orders Table View
  if (showOrders) {
    return (
      <div className="min-h-screen bg-black text-[#ecba49] p-6 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 transition-all duration-800 ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "-translate-y-8 opacity-0"
            }`}
          >
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3 hover:text-yellow-300 transition-colors duration-300">
                <ShoppingBag className="animate-bounce" />
                My Orders
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Total: {totalOrders} orders
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-400">Show:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(Number(e.target.value))}
                  className="bg-[#1a1a1a] border border-[#ecba49]/30 rounded px-3 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {/* Status filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-[#ecba49]" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="bg-[#1a1a1a] border border-[#ecba49]/30 rounded px-3 py-2 text-[#ecba49] focus:outline-none focus:ring-2 focus:ring-[#ecba49]/50"
                >
                  <option value="">All Orders</option>
                  <option value="Order Placed">Order Placed</option>
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Return Requested">Return Requested</option>
                </select>
              </div>

              <button
                onClick={() => {
                  setShowOrders(false);
                  setIsVisible(false);
                  setTimeout(() => setIsVisible(true), 100);
                }}
                className="px-6 py-3 border border-[#ecba49] rounded-lg hover:bg-[#ecba49] hover:text-black transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Back to Profile
              </button>
            </div>
          </div>

          {ordersLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-[#ecba49] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : orders.length > 0 ? (
            <div
              className={`transition-all duration-800 delay-200 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-8 opacity-0"
              }`}
            >
              {/* Desktop Table */}
              <div className="hidden md:block bg-[#1a1a1a] hidescroll rounded-lg border border-[#ecba49]/30 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto hidescroll">
                  <table className="w-full hidescroll">
                    <thead className="bg-gradient-to-r from-[#ecba49]/20 to-[#ecba49]/10 border-b border-[#ecba49]/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          <SortButton column="orderId">Order ID</SortButton>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          <SortButton column="createdAt">Date</SortButton>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          Items
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          <SortButton column="total">Total</SortButton>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          <SortButton column="currentStatus">Status</SortButton>
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-[#ecba49] uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#ecba49]/10">
                      {sortedOrders.map((order, index) => (
                        <tr
                          key={order._id}
                          className={`hover:bg-[#ecba49]/5 transition-all duration-300 transform hover:scale-[1.01] ${
                            isVisible
                              ? "translate-y-0 opacity-100"
                              : "translate-y-4 opacity-0"
                          }`}
                          style={{ transitionDelay: `${index * 50}ms` }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-[#ecba49] font-mono text-sm hover:text-yellow-300 transition-colors duration-300">
                              #{order.orderId}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-300 text-sm flex items-center gap-2">
                              <Calendar size={14} className="text-[#ecba49]" />
                              {new Date(order.createdAt).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Package size={16} className="text-[#ecba49]" />
                              <span className="text-gray-300 text-sm">
                                {order.items.length} item
                                {order.items.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-[#ecba49] font-bold text-lg hover:text-yellow-300 transition-colors duration-300">
                              ₹{order.total?.toLocaleString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-all duration-300 hover:scale-105 ${getStatusColor(
                                order.currentStatus
                              )}`}
                            >
                              {order.currentStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedOrder(order)}
                                className="flex items-center gap-1 px-3 py-2 bg-[#ecba49] text-black rounded-md hover:brightness-110 transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-medium"
                              >
                                <Eye size={14} />
                                View
                              </button>
                              {!["Delivered", "Cancelled"].includes(
                                order.currentStatus
                              ) && (
                                <button
                                  onClick={() => cancelOrder(order._id)}
                                  className="flex items-center gap-1 px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105 active:scale-95 text-sm font-medium"
                                >
                                  <XCircle size={14} />
                                  Cancel
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {sortedOrders.map((order, index) => (
                  <div
                    key={order._id}
                    className={`bg-[#1a1a1a] rounded-lg p-4 border border-[#ecba49]/30 hover:border-[#ecba49]/50 transition-all duration-300 hover:shadow-lg transform ${
                      isVisible
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: `${index * 50}ms` }}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-[#ecba49] font-mono text-sm">
                          #{order.orderId}
                        </h3>
                        <p className="text-gray-400 text-xs flex items-center gap-1 mt-1">
                          <Calendar size={12} />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          order.currentStatus
                        )}`}
                      >
                        {order.currentStatus}
                      </span>
                    </div>

                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center gap-2">
                        <Package size={14} className="text-[#ecba49]" />
                        <span className="text-gray-300 text-sm">
                          {order.items.length} items
                        </span>
                      </div>
                      <div className="text-[#ecba49] font-bold">
                        ₹{order.total?.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#ecba49] text-black rounded-md hover:brightness-110 transition-all duration-300 text-sm font-medium"
                      >
                        <Eye size={14} />
                        View Details
                      </button>
                      {!["Delivered", "Cancelled"].includes(
                        order.currentStatus
                      ) && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          className="px-3 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-500 hover:text-white transition-all duration-300 text-sm font-medium"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                totalItems={totalOrders}
                itemsPerPage={itemsPerPage}
              />
            </div>
          ) : (
            <div className="text-center py-20">
              <Package
                size={64}
                className="mx-auto mb-4 text-gray-600 animate-pulse"
              />
              <h3 className="text-xl font-semibold mb-2">No Orders Found</h3>
              <p className="text-gray-400">
                {statusFilter 
                  ? `No orders found with status "${statusFilter}"`
                  : "Your order history will appear here"
                }
              </p>
              {statusFilter && (
                <button
                  onClick={() => handleStatusFilterChange('')}
                  className="mt-4 px-4 py-2 border border-[#ecba49] rounded-lg hover:bg-[#ecba49] hover:text-black transition-all duration-300"
                >
                  Show All Orders
                </button>
              )}
            </div>
          )}
        </div>

        {/* Enhanced Modal */}
       {selectedOrder && (
  <div className="fixed inset-0  backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
    <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] rounded-2xl max-w-4xl w-full lg:max-h-[70vh] mt-44 overflow-hidden border border-[#ecba49]/30 shadow-2xl animate-slideUp">
      {/* Modal Header */}
      <div className="bg-gradient-to-r from-[#ecba49]/20 to-[#ecba49]/10 px-6 py-4 border-b border-[#ecba49]/30">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#ecba49] flex items-center gap-2">
              <Package className="animate-pulse" />
              Order Details
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              Order #{selectedOrder.orderId}
            </p>
          </div>
          <button
            onClick={() => setSelectedOrder(null)}
            className="p-2 hover:bg-red-500/20 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-red-400"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Modal Content */}
      <div className="p-6 overflow-y-auto max-h-[50vh] hidescroll custom-scrollbar">
        {/* Order Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#ecba49]/10 p-4 rounded-lg border border-[#ecba49]/20 hover:border-[#ecba49]/40 transition-all duration-300">
            <p className="text-gray-400 text-sm">Order ID</p>
            <p className="text-[#ecba49] font-bold font-mono">
              #{selectedOrder.orderId}
            </p>
          </div>
          <div className="bg-blue-400/10 p-4 rounded-lg border border-blue-400/20 hover:border-blue-400/40 transition-all duration-300">
            <p className="text-gray-400 text-sm">Status</p>
            <p
              className={`font-bold ${
                getStatusColor(selectedOrder.currentStatus).split(
                  " "
                )[0]
              }`}
            >
              {selectedOrder.currentStatus}
            </p>
          </div>
          <div className="bg-green-400/10 p-4 rounded-lg border border-green-400/20 hover:border-green-400/40 transition-all duration-300">
            <p className="text-gray-400 text-sm">Total Amount</p>
            <p className="text-green-400 font-bold text-lg">
              ₹{selectedOrder.total?.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-400/10 p-4 rounded-lg border border-purple-400/20 hover:border-purple-400/40 transition-all duration-300">
            <p className="text-gray-400 text-sm">Payment Method</p>
            <p className="text-purple-400 font-semibold">
              {selectedOrder.paymentMethod}
            </p>
          </div>
        </div>

        {/* Tracking Information - Show only for Shipped orders */}
        {selectedOrder.currentStatus === "Shipped" && (selectedOrder.trackingNumber || selectedOrder.trackingCompany) && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-[#ecba49] flex items-center gap-2">
              <Truck size={20} />
              Tracking Information
            </h3>
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 p-4 rounded-lg border border-blue-500/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedOrder.trackingCompany && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Building2 size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Shipping Company</p>
                      <p className="text-blue-400 font-semibold text-lg">
                        {selectedOrder.trackingCompany}
                      </p>
                    </div>
                  </div>
                )}
                {selectedOrder.trackingNumber && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Hash size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tracking Number</p>
                      <p className="text-blue-400 font-semibold text-lg font-mono">
                        {selectedOrder.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          </div>
        )}

        {/* Order Timeline */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#ecba49] flex items-center gap-2">
            <Calendar size={20} />
            Order Timeline
          </h3>
          <div className="bg-[#0f0f0f] p-4 rounded-lg border border-[#ecba49]/20">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-[#ecba49] rounded-full animate-pulse"></div>
              <div>
                <p className="text-[#ecba49] font-medium">
                  Order Placed
                </p>
                <p className="text-gray-400 text-sm">
                  {new Date(selectedOrder.createdAt).toLocaleString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Items Ordered */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#ecba49] flex items-center gap-2">
            <ShoppingBag size={20} />
            Items Ordered ({selectedOrder.items.length})
          </h3>
          <div className="space-y-3">
            {selectedOrder.items.map((item, idx) => (
              <div
                key={idx}
                // onClick={() => selectProduct(item)}
                className="bg-[#0f0f0f] cursor-pointer rounded-lg p-4 border border-[#ecba49]/20 hover:border-[#ecba49]/40 transition-all duration-300 hover:shadow-lg"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-16 h-16 bg-[#ecba49]/20 rounded-lg flex items-center justify-center border border-[#ecba49]/30 overflow-hidden">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={24} className="text-[#ecba49]" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold text-lg hover:text-[#ecba49] transition-colors duration-300">
                        {item.product?.name || item.name}
                      </h4>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            Quantity:
                          </span>
                          <span className="bg-[#ecba49]/20 text-[#ecba49] px-2 py-1 rounded-full text-sm font-medium">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 text-sm">
                            Unit Price:
                          </span>
                          <span className="text-white font-medium">
                            ₹
                            {(
                              item.product?.price || item.price
                            )?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-[#ecba49] font-bold text-xl">
                        ₹
                        {(
                          (item.product?.price || item.price) *
                          item.quantity
                        )?.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-sm">Total</p>
                    </div>
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex gap-3 mb-3">
                    <div className="w-16 h-16 bg-[#ecba49]/20 rounded-lg flex items-center justify-center border border-[#ecba49]/30 overflow-hidden flex-shrink-0">
                      {item.product?.images?.[0] ? (
                        <img
                          src={item.product.images[0].url}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package size={20} className="text-[#ecba49]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-base hover:text-[#ecba49] transition-colors duration-300 truncate">
                        {item.product?.name || item.name}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                        <div>
                          <span className="text-gray-400">
                            Quantity:
                          </span>
                          <span className="text-[#ecba49] font-medium ml-1">
                            {item.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">
                            Unit Price:
                          </span>
                          <span className="text-white font-medium ml-1">
                            ₹
                            {(
                              item.product?.price || item.price
                            )?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[#ecba49] font-bold text-lg">
                        ₹
                        {(
                          (item.product?.price || item.price) *
                          item.quantity
                        )?.toLocaleString()}
                      </p>
                      <p className="text-gray-400 text-xs">
                        Total Price
                      </p>
                    </div>

                    
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary Breakdown */}
        <div className="bg-gradient-to-r from-[#ecba49]/10 to-[#ecba49]/5 p-6 rounded-lg border border-[#ecba49]/30">
          <h3 className="text-lg font-semibold mb-4 text-[#ecba49]">
            Order Summary
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Subtotal</span>
              <span className="text-white font-medium">
                ₹
                {selectedOrder.items
                  .reduce((total, item) => {
                    const price =
                      item.product?.price || item.price || 0;
                    return total + price * item.quantity;
                  }, 0)
                  .toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Shipping</span>
              <span className="text-green-400 font-medium">FREE</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Tax</span>
              <span className="text-white font-medium">Included</span>
            </div>
            <div className="border-t border-[#ecba49]/30 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[#ecba49] font-bold text-lg">
                  Total
                </span>
                <span className="text-[#ecba49] font-bold text-2xl">
                  ₹{selectedOrder.total?.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Footer */}
      <div className="bg-gradient-to-r from-[#0f0f0f] to-[#1a1a1a] px-6 py-4 border-t border-[#ecba49]/30">
        <div className="flex justify-between items-center">
          <div
            onClick={() => navigate("/contactus")}
            className="text-sm hedden opacity-0 lg:flex lg:opacity-100 cursor-pointer text-gray-400"
          >
            Need help? Contact our support team
          </div>
          <div onClick={() => downloadReceiptAsPDF(selectedOrder)}
           className="flex items-center cursor-pointer gap-2 px-4 py-2 border mr-2 border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all duration-300 hover:scale-105">
                  Download Receipt
          </div>
          <div className="flex gap-3">
            {!["Delivered", "Cancelled"].includes(
              selectedOrder.currentStatus
            ) && (
              <button
                onClick={() => {
                  cancelOrder(selectedOrder._id);
                  setSelectedOrder(null);
                }}
                className="flex items-center gap-2 z-[105] px-4 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all duration-300 hover:scale-105"
              >
                <XCircle size={16} />
                Cancel Order
              </button>
            )}
            <button
              onClick={() => setSelectedOrder(null)}
              className="px-6 py-2 bg-[#ecba49] text-black rounded-lg font-semibold hover:brightness-110 transition-all duration-300 hover:scale-105 hidden opacity-0 lg:flex lg:opacity-100"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#ecba49] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#ecba49] animate-pulse">Loading Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#ecba49] p-6 overflow-hidden">
      <div className="max-w-4xl mx-auto">
        <div
          className={`flex justify-between items-center mb-8 transition-all duration-800 ${
            isVisible ? "translate-y-0 opacity-100" : "-translate-y-8 opacity-0"
          }`}
        >
          <h1 className="text-3xl font-bold flex items-center gap-3 hover:text-yellow-300 transition-colors duration-300">
            <User className="animate-pulse" /> My Profile
          </h1>
          <button
            onClick={() => {
              setShowOrders(true);
              setIsVisible(false);
              setTimeout(() => {
                setIsVisible(true);
                fetchOrders(1, itemsPerPage, statusFilter);
              }, 100);
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#ecba49] text-black rounded-lg font-semibold hover:brightness-110 transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <Package size={20} /> My Orders
          </button>
        </div>

        {/* Profile Image Section */}
        <div
          className={`text-center mb-8 transition-all duration-800 delay-200 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/png, image/jpeg, image/gif"
          />
          <div
            className="relative inline-block group cursor-pointer"
            onClick={handleImageClick}
          >
            <img
              src={profileData?.image || "https://via.placeholder.com/150"}
              alt="Profile"
              className={`w-32 h-32 rounded-full border-4 border-[#ecba49] object-cover transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl ${
                imageUploadLoading ? "opacity-50" : ""
              }`}
            />
            {imageUploadLoading ? (
              <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <Settings className="text-white animate-spin-slow" size={24} />
              </div>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-2">Click image to change</p>
        </div>

        {/* Profile Fields */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <h2
              className={`text-xl font-semibold mb-4 text-[#ecba49] transition-all duration-800 delay-300 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "-translate-x-8 opacity-0"
              }`}
            >
              Basic Information
            </h2>
            <EditableField
              label="Full Name"
              field="name"
              value={profileData?.name}
              icon={User}
              handleSave={handleSave}
            />
            <EditableField
              label="Phone Number"
              field="phone"
              value={profileData?.phone}
              type="tel"
              icon={Phone}
              handleSave={handleSave}
            />
            <EditableField
              label="Email"
              field="profile.email"
              value={profileData?.profile?.email}
              icon={Mail}
              handleSave={handleSave}
            />
            <EditableField
              label="Age"
              field="profile.age"
              value={profileData?.profile?.age}
              type="number"
              icon={Calendar}
              handleSave={handleSave}
            />
            <EditableField
              label="Gender"
              field="profile.gender"
              value={profileData?.profile?.gender}
              type="select"
              icon={User}
              handleSave={handleSave}
            />
            <EditableDOBField
              label="Date of Birth"
              field="profile.dateOfBirth"
              value={profileData?.profile?.dateOfBirth}
              icon={Calendar}
              handleSave={handleSave}
            />

              <div className="border text-xl  border-[#FFD700] p-5 rounded-full flex justify-center items-center cursor-pointer" onClick={()=>navigate('/resetpassword')}>
                Reset-password?
              </div>

          </div>
          <div className="space-y-4">
            <h2
              className={`text-xl font-semibold mb-4 text-[#ecba49] transition-all duration-800 delay-400 ${
                isVisible
                  ? "translate-x-0 opacity-100"
                  : "translate-x-8 opacity-0"
              }`}
            >
              Address & Details
            </h2>
            <EditableField
              label="Address"
              field="profile.address"
              value={profileData?.profile?.address}
              icon={MapPin}
              handleSave={handleSave}
            />
            <EditableField
              label="City"
              field="profile.city"
              value={profileData?.profile?.city}
              icon={MapPin}
              handleSave={handleSave}
            />
            <EditableField
              label="State"
              field="profile.state"
              value={profileData?.profile?.state}
              icon={MapPin}
              handleSave={handleSave}
            />
            <EditableField
              label="Zip Code"
              field="profile.zipCode"
              value={profileData?.profile?.zipCode}
              icon={MapPin}
              handleSave={handleSave}
            />
            <EditableField
              label="Country"
              field="profile.country"
              value={profileData?.profile?.country}
              icon={MapPin}
              handleSave={handleSave}
            />
          </div>
        </div>

        <div
          className={`mt-8 space-y-4 transition-all duration-800 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4 text-[#ecba49]">
            Additional Information
          </h2>
          <EditableField
            label="Occupation"
            field="profile.occupation"
            value={profileData?.profile?.occupation}
            icon={Settings}
            handleSave={handleSave}
          />
          <EditableField
            label="Bio"
            field="profile.bio"
            value={profileData?.profile?.bio}
            icon={User}
            handleSave={handleSave}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            transform: translateY(100px);
            opacity: 0;
          }
          100% {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.4s ease-out;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1a1a1a;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #ecba49;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d4a437;
        }
      `}</style>
    </div>
  );
};

export default Profile;