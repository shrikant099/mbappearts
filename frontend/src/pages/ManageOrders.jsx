import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { orderEndpoints } from "../services/api";
import { setLoading } from "../slices/authSlice";
import toast from "react-hot-toast";

const { getAllOrders, updateOrderStatus, addTrackingInfo } = orderEndpoints;

const ManageOrders = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all");
  const [statusError, setStatusError] = useState("");

  const [trackingId, setTrackingId] = useState("");
  const [courier, setCourier] = useState("India Post");

  const token = useSelector((state) => state.auth.token);

  // Valid status transitions matching backend logic
  const validTransitions = {
    "Order Placed": ["Payment Pending", "Cancelled"],
    "Payment Pending": ["Payment Received", "Cancelled"],
    "Payment Received": ["Processing", "Cancelled"],
    Processing: ["Shipped", "Cancelled"],
    Shipped: ["Out for Delivery", "Cancelled"],
    "Out for Delivery": ["Delivered", "Cancelled"],
    Delivered: ["Return Requested"],
    Cancelled: [],
    "Return Requested": ["Return Approved", "Return Rejected"],
    "Return Approved": ["Return Completed", "Refund Initiated"],
    "Return Rejected": [],
    "Return Completed": ["Refund Initiated"],
    "Refund Initiated": ["Refund Completed"],
    "Refund Completed": [],
  };

  // All possible statuses in order
  const allStatuses = [
    "Order Placed",
    "Payment Pending",
    "Payment Received",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Return Requested",
    "Return Approved",
    "Return Rejected",
    "Return Completed",
    "Refund Initiated",
    "Refund Completed",
    "Cancelled",
  ];

  // Get valid next statuses for current order status
  const getValidStatusOptions = (currentStatus) => {
    return validTransitions[currentStatus] || [];
  };

  // Get status completion state
  const getStatusState = (status, currentStatus, selectedStatus) => {
    const currentIndex = allStatuses.indexOf(currentStatus);
    const statusIndex = allStatuses.indexOf(status);
    const selectedIndex = allStatuses.indexOf(selectedStatus);

    if (status === currentStatus) return "current";
    if (statusIndex < currentIndex) return "completed";
    if (status === selectedStatus) return "selected";
    if (selectedIndex !== -1 && statusIndex < selectedIndex)
      return "willComplete";
    return "pending";
  };

  // Check if status can be selected
  const canSelectStatus = (status, currentStatus) => {
    const validOptions = getValidStatusOptions(currentStatus);
    return validOptions.includes(status);
  };

  // Handle status selection
  const handleStatusSelection = (status) => {
    if (!selectedOrder) return;

    if (canSelectStatus(status, selectedOrder.currentStatus)) {
      setNewStatus(status);
      setStatusError("");
    } else {
      setStatusError(
        `Cannot transition from "${selectedOrder.currentStatus}" to "${status}". Please select a valid status.`
      );
      setTimeout(() => setStatusError(""), 3000);
    }
  };

  // Search and filter function
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const filtered = orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();

      switch (searchFilter) {
        case "orderId":
          return order.orderId.toLowerCase().includes(searchLower);
        case "customer":
          return (
            order.user?.name?.toLowerCase().includes(searchLower) ||
            order.user?.phone?.toString().includes(searchLower)
          );
        case "date":
          const orderDate = new Date(order.createdAt)
            .toLocaleDateString()
            .toLowerCase();
          return orderDate.includes(searchLower);
        case "all":
        default:
          return (
            order.orderId.toLowerCase().includes(searchLower) ||
            order.user?.name?.toLowerCase().includes(searchLower) ||
            order.user?.phone?.toString().includes(searchLower) ||
            new Date(order.createdAt)
              .toLocaleDateString()
              .toLowerCase()
              .includes(searchLower)
          );
      }
    });

    setFilteredOrders(filtered);
  };

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
    setSearchFilter("all");
    setFilteredOrders(orders);
  };

  const fetchOrders = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector(
        "GET",
        `${getAllOrders}?page=${page}&limit=10`,
        null,
        {
          Authorization: `Bearer ${token}`,
        }
      );

      console.log("response for all the orders is : ", res);

      if (res.data.success) {
        setOrders(res.data.orders);
        setFilteredOrders(res.data.orders);
        setTotalPages(res.data.pages);
        toast.success("Orders fetched!");
      }
    } catch (err) {
      toast.error("Unable to fetch orders");
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handlePageChange = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }

    // Validate tracking information for shipped status
    if (newStatus === "Shipped" && !trackingId.trim()) {
      toast.error("Please enter tracking ID for shipped orders");
      return;
    }

    try {
      const requestBody = {
        status: newStatus,
        note: "Updated via admin panel",
      };

      // Add tracking information if status is Shipped
      if (newStatus === "Shipped") {
        requestBody.trackingId = trackingId.trim();
        requestBody.courier = courier;
      }

      await apiConnector(
        "PUT",
        `${updateOrderStatus}${selectedOrder._id}/status`,
        requestBody,
        {
          Authorization: `Bearer ${token}`,
        }
      );
      toast.success("Order status updated!");
      fetchOrders();
      setShowStatusModal(false);
      setNewStatus("");
      setTrackingId("");
      setCourier("India Post");
      setStatusError("");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to update status";
      toast.error(errorMessage);
      console.error(error);
    }
  };

  // Get status badge color based on status
  const getStatusBadgeColor = (status) => {
    const colorMap = {
      "Order Placed": "bg-blue-100 text-blue-800",
      "Payment Pending": "bg-yellow-100 text-yellow-800",
      "Payment Received": "bg-green-100 text-green-800",
      Processing: "bg-purple-100 text-purple-800",
      Shipped: "bg-indigo-100 text-indigo-800",
      "Out for Delivery": "bg-orange-100 text-orange-800",
      Delivered: "bg-green-200 text-green-900",
      Cancelled: "bg-red-100 text-red-800",
      "Return Requested": "bg-yellow-200 text-yellow-900",
      "Return Approved": "bg-blue-200 text-blue-900",
      "Return Rejected": "bg-red-200 text-red-900",
      "Return Completed": "bg-gray-200 text-gray-900",
      "Refund Initiated": "bg-orange-200 text-orange-900",
      "Refund Completed": "bg-green-300 text-green-900",
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  useEffect(() => {
    fetchOrders();
  }, [page]);

  // Update filtered orders when search term or filter changes
  useEffect(() => {
    handleSearch();
  }, [searchTerm, searchFilter, orders]);

  return (
    <div className="manage-orders text-[#FFD700] w-[100vw] lg:w-[calc(100vw-256px)] overflow-y-auto h-screen p-3 sm:p-6 hidescroll">
      <h2 className="text-xl sm:text-2xl font-bold mb-4">Manage Orders</h2>

      {/* Search Bar */}
      <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
          <div className="flex-1 flex flex-col sm:flex-row gap-2">
            <select
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm sm:text-base"
            >
              <option value="all">Search All</option>
              <option value="orderId">Order ID</option>
              <option value="customer">Customer</option>
              <option value="date">Order Date</option>
            </select>
            <input
              type="text"
              placeholder={`Search by ${
                searchFilter === "all"
                  ? "Order ID, Customer, or Date"
                  : searchFilter === "orderId"
                  ? "Order ID"
                  : searchFilter === "customer"
                  ? "Customer Name or Phone"
                  : "Order Date (MM/DD/YYYY)"
              }`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-[#FFD700] text-sm sm:text-base"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-3 sm:px-4 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors text-sm sm:text-base"
            >
              Search
            </button>
            {(searchTerm || searchFilter !== "all") && (
              <button
                onClick={clearSearch}
                className="px-3 sm:px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
              >
                Clear
              </button>
            )}
          </div>
        </div>
        {searchTerm && (
          <div className="mt-3 text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
            {searchFilter !== "all" && ` (filtered by ${searchFilter})`}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-[#FFD700] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Mobile Cards View */}
          <div className="block lg:hidden space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-lg shadow-lg p-4 text-black"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg">{order.orderId}</h3>
                    <p className="text-gray-600 text-sm">{order.user?.name}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                      order.currentStatus
                    )}`}
                  >
                    {order.currentStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div>
                    <span className="text-gray-500">Items:</span>
                    <span className="ml-1 font-medium">
                      {order.items.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Total:</span>
                    <span className="ml-1 font-bold">₹{order.total}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment:</span>
                    <span
                      className={`ml-1 px-2 py-0.5 rounded text-xs ${
                        order.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-1">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowStatusModal(true);
                      setNewStatus("");
                      setStatusError("");
                    }}
                  >
                    Update Status
                  </button>
                  <button
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowDetailModal(true);
                    }}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full min-w-[900px] bg-white text-black">
              <thead className="bg-[#FFD700]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Order ID
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Items</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Payment</th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Placed On
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-t border-gray-200 hover:bg-[#f9f9f9] transition-colors"
                  >
                    <td className="px-4 py-3 font-semibold">{order.orderId}</td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="font-medium">{order.user?.name}</div>
                        <div className="text-sm text-gray-500">
                          {order.user?.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{order.items.length} item(s)</td>
                    <td className="px-4 py-3 font-bold">₹{order.total}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeColor(
                          order.currentStatus
                        )}`}
                      >
                        {order.currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          order.paymentStatus === "Completed"
                            ? "bg-green-100 text-green-800"
                            : order.paymentStatus === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.paymentStatus === "Refunded"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col xl:flex-row gap-1 xl:gap-2">
                        <button
                          className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors whitespace-nowrap"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowStatusModal(true);
                            setNewStatus("");
                            setStatusError("");
                          }}
                        >
                          Update Status
                        </button>
                        <button
                          className="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors whitespace-nowrap"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDetailModal(true);
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* No Results Message */}
          {filteredOrders.length === 0 && searchTerm && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">No orders found</div>
              <div className="text-gray-500 text-sm">
                Try adjusting your search terms or filters
              </div>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-8 gap-1 sm:gap-2 flex-wrap">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`px-2 sm:px-3 py-1 rounded text-sm sm:text-base ${
                  page === i + 1
                    ? "bg-[#FFD700] text-black font-bold"
                    : "border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700] hover:text-black"
                } transition-colors`}
                onClick={() => handlePageChange(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-lg bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[70vh] mt-16 overflow-y-auto text-black relative hidescroll">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800">
                Order Details: {selectedOrder.orderId}
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold p-1"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-lg border border-blue-200">
                <h4 className="text-lg font-semibold mb-4 text-blue-800">
                  Order Summary
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-blue-600">
                      ₹{selectedOrder.total}
                    </div>
                    <div className="text-sm text-gray-600">Total Amount</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedOrder.items.length}
                    </div>
                    <div className="text-sm text-gray-600">Items</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div
                      className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusBadgeColor(
                        selectedOrder.currentStatus
                      )}`}
                    >
                      {selectedOrder.currentStatus}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Status</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-lg shadow-sm">
                    <div className="text-sm font-medium text-gray-800">
                      {selectedOrder.paymentMethod}
                    </div>
                    <div className="text-sm text-gray-600">Payment Method</div>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-lg border border-green-200">
                <h4 className="text-lg font-semibold mb-4 text-green-800">
                  Customer Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Name
                    </label>
                    <div className="text-base font-semibold">
                      {selectedOrder.user?.name}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Phone
                    </label>
                    <div className="text-base">{selectedOrder.user?.phone}</div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Order Date
                    </label>
                    <div className="text-base">
                      {new Date(selectedOrder.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Ordered Items */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 sm:p-6 rounded-lg border border-purple-200">
                <h4 className="text-lg font-semibold mb-4 text-purple-800">
                  Ordered Items
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-lg shadow-sm border"
                    >
                      <div className="w-full sm:w-20 h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTIwSDgwVjEwMEgxMDBWMTIwWk0xMjAgMTIwSDEwMFYxMDBIMTIwVjEyMFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN2Zz4K";
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <h5 className="font-semibold text-gray-800">
                              {item.name}
                            </h5>
                            <p className="text-sm text-gray-600">
                              Quantity: {item.quantity}
                            </p>
                            <p className="text-sm text-gray-600">
                              Color: {item.color}
                            </p>
                            <p className="text-sm text-gray-600">
                              Size: {item.size}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-blue-600">
                              ₹{item.price}
                            </div>
                            <div className="text-sm text-gray-500">
                              ₹{item.price * item.quantity} total
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-4 sm:p-6 rounded-lg border border-yellow-200">
                <h4 className="text-lg font-semibold mb-4 text-yellow-800">
                  Pricing Breakdown
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-yellow-200">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">
                      ₹{selectedOrder.subtotal}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-yellow-200">
                    <span className="text-gray-600">Shipping Fee</span>
                    <span className="font-medium">
                      ₹{selectedOrder.shippingFee}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-yellow-200">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">₹{selectedOrder.tax}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between py-2 border-b border-yellow-200">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-medium text-green-600">
                        -₹{selectedOrder.discount}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between py-3 border-t-2 border-yellow-300">
                    <span className="text-lg font-semibold text-gray-800">
                      Total Amount
                    </span>
                    <span className="text-lg font-bold text-blue-600">
                      ₹{selectedOrder.total}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 sm:p-6 rounded-lg border border-indigo-200">
                <h4 className="text-lg font-semibold mb-4 text-indigo-800">
                  Shipping Address
                </h4>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Recipient Name
                      </label>
                      <div className="text-base font-semibold">
                        {selectedOrder.shippingAddress?.recipientName}
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Phone
                      </label>
                      <div className="text-base">
                        {selectedOrder.shippingAddress?.phone}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-sm font-medium text-gray-600">
                        Address
                      </label>
                      <div className="text-base">
                        {selectedOrder.shippingAddress?.street},{" "}
                        {selectedOrder.shippingAddress?.city}
                        <br />
                        {selectedOrder.shippingAddress?.state} -{" "}
                        {selectedOrder.shippingAddress?.postalCode}
                        <br />
                        {selectedOrder.shippingAddress?.country}
                      </div>
                    </div>
                    {selectedOrder.shippingAddress?.landmark && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Landmark
                        </label>
                        <div className="text-base">
                          {selectedOrder.shippingAddress?.landmark}
                        </div>
                      </div>
                    )}
                    {selectedOrder.shippingAddress?.instructions && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Delivery Instructions
                        </label>
                        <div className="text-base">
                          {selectedOrder.shippingAddress?.instructions}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tracking Information - Show if order has tracking details */}
              {selectedOrder.trackingNumber && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 sm:p-6 rounded-lg border border-indigo-200">
                  <h4 className="text-lg font-semibold mb-4 text-indigo-800">
                    📦 Tracking Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <label className="text-sm font-medium text-gray-600">
                        Tracking Number
                      </label>
                      <div className="text-base font-semibold text-indigo-600">
                        {selectedOrder.trackingNumber}
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <label className="text-sm font-medium text-gray-600">
                        Courier Company
                      </label>
                      <div className="text-base font-semibold">
                        {selectedOrder.trackingCompany || "India Post"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-indigo-100 rounded-lg">
                    <p className="text-sm text-indigo-700">
                      ✅ Customer has been notified about the tracking details
                      via email.
                    </p>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-4 sm:p-6 rounded-lg border border-gray-200">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">
                  Payment Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-600">
                      Payment Method
                    </label>
                    <div className="text-base font-semibold">
                      {selectedOrder.paymentMethod}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <label className="text-sm font-medium text-gray-600">
                      Payment Status
                    </label>
                    <div
                      className={`text-sm font-medium px-2 py-1 rounded-full inline-block mt-1 ${
                        selectedOrder.paymentStatus === "Completed"
                          ? "bg-green-100 text-green-800"
                          : selectedOrder.paymentStatus === "Pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : selectedOrder.paymentStatus === "Refunded"
                          ? "bg-red-100 text-red-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {selectedOrder.paymentStatus}
                    </div>
                  </div>
                  {selectedOrder.paymentId && (
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <label className="text-sm font-medium text-gray-600">
                        Payment ID
                      </label>
                      <div className="text-base font-mono text-sm break-all">
                        {selectedOrder.paymentId}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {selectedOrder.notes && (
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 sm:p-6 rounded-lg border border-amber-200">
                  <h4 className="text-lg font-semibold mb-4 text-amber-800">
                    Order Notes
                  </h4>
                  <div className="bg-white p-4 rounded-lg shadow-sm">
                    <p className="text-gray-700">{selectedOrder.notes}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    setShowStatusModal(true);
                    setNewStatus("");
                    setStatusError("");
                  }}
                  className="px-6 py-3 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Update Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 backdrop-blur-3xl bg-opacity-50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[70vh] overflow-y-auto text-black mt-16 hidescroll">
            <div className="sticky top-0 bg-white border-b p-4 sm:p-6 flex justify-between items-center">
              <h3 className="text-xl sm:text-2xl font-bold">
                Update Status: {selectedOrder.orderId}
              </h3>
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setNewStatus("");
                  setTrackingId("");
                  setCourier("India Post");
                  setStatusError("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="mb-6">
                <p className="text-lg mb-2">
                  Current Status:{" "}
                  <span className="font-semibold text-blue-600">
                    {selectedOrder.currentStatus}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Click on any valid status below to select it. Invalid
                  transitions will show an error.
                </p>
              </div>

              {/* Error Message */}
              {statusError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-red-500 mr-2">⚠️</span>
                    {statusError}
                  </div>
                </div>
              )}

              {/* Status Timeline */}
              <div className="mb-6">
                <h4 className="text-lg font-semibold mb-4">
                  Order Status Timeline
                </h4>
                <div className="space-y-3">
                  {allStatuses.map((status, index) => {
                    const statusState = getStatusState(
                      status,
                      selectedOrder.currentStatus,
                      newStatus
                    );
                    const canSelect = canSelectStatus(
                      status,
                      selectedOrder.currentStatus
                    );
                    const isCurrentStatus =
                      status === selectedOrder.currentStatus;
                    const isSelected = status === newStatus;

                    return (
                      <div
                        key={status}
                        className={`flex items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                          isSelected
                            ? "border-blue-500 bg-blue-50"
                            : isCurrentStatus
                            ? "border-green-500 bg-green-50"
                            : canSelect
                            ? "border-gray-300 bg-white hover:border-blue-300 hover:bg-blue-50 cursor-pointer"
                            : "border-gray-200 bg-gray-50 opacity-60"
                        }`}
                        onClick={() =>
                          canSelect && handleStatusSelection(status)
                        }
                      >
                        {/* Status Icon */}
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                            statusState === "completed" || isCurrentStatus
                              ? "bg-green-500 text-white"
                              : statusState === "selected"
                              ? "bg-blue-500 text-white"
                              : canSelect
                              ? "bg-gray-300 text-gray-600 hover:bg-blue-400 hover:text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}
                        >
                          {statusState === "completed" || isCurrentStatus ? (
                            <span className="text-sm font-bold">✓</span>
                          ) : statusState === "selected" ? (
                            <span className="text-sm font-bold">→</span>
                          ) : (
                            <span className="text-xs">{index + 1}</span>
                          )}
                        </div>

                        {/* Status Details */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                            <h5
                              className={`font-medium ${
                                isCurrentStatus
                                  ? "text-green-700"
                                  : isSelected
                                  ? "text-blue-700"
                                  : canSelect
                                  ? "text-gray-800"
                                  : "text-gray-500"
                              }`}
                            >
                              {status}
                            </h5>
                            <div className="flex items-center space-x-2 mt-1 sm:mt-0">
                              {isCurrentStatus && (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  Current
                                </span>
                              )}
                              {isSelected && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  Selected
                                </span>
                              )}
                              {canSelect && !isCurrentStatus && !isSelected && (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  Available
                                </span>
                              )}
                              {!canSelect && !isCurrentStatus && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                                  Unavailable
                                </span>
                              )}
                            </div>
                          </div>
                          {!canSelect && !isCurrentStatus && (
                            <p className="text-xs text-gray-500 mt-1">
                              Cannot transition directly from "
                              {selectedOrder.currentStatus}" to "{status}"
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tracking Information Fields - Show only when "Shipped" is selected */}
              {newStatus === "Shipped" && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h5 className="font-semibold text-orange-800 mb-4">
                    Tracking Information Required
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tracking ID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={trackingId}
                        onChange={(e) => setTrackingId(e.target.value)}
                        placeholder="Enter tracking ID"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Courier Company
                      </label>
                      <select
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="India Post">India Post</option>
                        <option value="BlueDart">BlueDart</option>
                        <option value="DTDC">DTDC</option>
                        <option value="FedEx">FedEx</option>
                        <option value="Delhivery">Delhivery</option>
                        <option value="Ecom Express">Ecom Express</option>
                        <option value="Xpressbees">Xpressbees</option>
                        <option value="Aramex">Aramex</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <p className="text-sm text-orange-600 mt-2">
                    This information will be sent to the customer via email for
                    order tracking.
                  </p>
                </div>
              )}

              {/* Selected Status Summary */}
              {newStatus && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h5 className="font-semibold text-blue-800 mb-2">
                    Status Update Summary
                  </h5>
                  <p className="text-sm text-blue-700">
                    Order will be updated from{" "}
                    <span className="font-semibold">
                      "{selectedOrder.currentStatus}"
                    </span>{" "}
                    to <span className="font-semibold">"{newStatus}"</span>
                  </p>
                  {newStatus === "Shipped" && trackingId && (
                    <p className="text-sm text-blue-700 mt-1">
                      Tracking ID:{" "}
                      <span className="font-semibold">{trackingId}</span> via{" "}
                      {courier}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowStatusModal(false);
                    setNewStatus("");
                    setTrackingId("");
                    setCourier("India Post");
                    setStatusError("");
                  }}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={
                    !newStatus ||
                    (newStatus === "Shipped" && !trackingId.trim())
                  }
                  className="px-6 py-2 bg-[#FFD700] text-black font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-500 transition-colors"
                >
                  {newStatus === "Shipped" && !trackingId.trim()
                    ? "Enter Tracking ID"
                    : "Update Status"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
