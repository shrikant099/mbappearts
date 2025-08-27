import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area, RadialBarChart, RadialBar
} from 'recharts';
import { 
  Users, ShoppingBag, Package, TrendingUp, DollarSign, Eye, Star,
  Calendar, Filter, Download, RefreshCw, ArrowUp, ArrowDown
} from 'lucide-react';
import { endpoints, orderEndpoints, reviewEndpoints } from '../services/api';
import { apiConnector } from '../services/apiConnector';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setLoading } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

const {adminDashboard, getUserNoPagination} = endpoints;
const { allOrdersWithoutPagination } = orderEndpoints;

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalItemsSold: 0,
    totalStock: 0,
    outOfStock: 0,
    topProducts: [],
    category: [],
    products: [],
    completedOrders: []
  });

  const navigate = useNavigate()

  const dispatch = useDispatch();
  const token = useSelector(state => state.auth.token)

  const [monthlyData, setMonthlyData] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [avgRating,setAvgRating] = useState(5)
  
  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiConnector("GET", adminDashboard, null,
        {
          Authorization: `Bearer ${token}`
        });
      console.log('API Response:', response);

      if (response?.data?.success) {
        const data = response.data.stats;
        
        const mappedStats = {
          totalUsers: data.totalUsers || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
          totalItemsSold: data.totalItemsSold || 0,
          totalStock: data.totalStock || 0,
          outOfStock: data.outOfStock || 0,
          topProducts: data.topProducts || [],
          category: data.categories || [],
          products: data.products || [],
          completedOrders: data.completedOrders || []
        };

        setStats(mappedStats);
      } else {
        throw new Error("Failed to fetch dashboard data");
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvgRating = async () => {
    try{
      dispatch(setLoading(true));
      const avgRating = await apiConnector("GET",reviewEndpoints.avgRating);
      console.log("avg rating is :",avgRating)
      setAvgRating(avgRating.data.averageRating)
    }catch(error){
      console.log("avg rating error is :",error);
    }finally{
      dispatch(setLoading(false))
    }
  }

  const fetchOrders = async () => {
    try {
      dispatch(setLoading(true));
      console.log(token)
      const res = await apiConnector("GET", allOrdersWithoutPagination ,null,
        {
          Authorization: `Bearer ${token}`
        });
      console.log(res);
      if (res.data.success) {
        setOrders(res.data.orders);
        setTotalPages(res.data.pages);
      }
    } catch (err) {
      toast.error("Unable to fetch orders");
      console.error(err);
    } finally {
      dispatch(setLoading(false));
    }
  };
  
  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchUser = async () => {
    try {
      dispatch(setLoading(true));
      const userRes = await apiConnector("GET", getUserNoPagination,null,{
        Authorization : `Bearer ${token}`
      });
      console.log(userRes);
      if (userRes.data.success) {
        setUsers(userRes.data.users || []);
      }
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch users");
    } finally {
      dispatch(setLoading(false));
    }
  }

  useEffect(() => {
    fetchUser();
    fetchAvgRating();
  }, [])

  // Generate monthly data from orders
  const generateMonthlyData = (statsData) => {
    const groupedData = {};
    const currentDate = new Date();

    // Initialize data structure based on selected period
    switch (selectedPeriod) {
      case 'daily':
        for (let i = 6; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setDate(date.getDate() - i);
          const key = date.toISOString().split('T')[0];
          groupedData[key] = {
            date: key,
            revenue: 0,
            orders: 0,
            users: 0
          };
        }
        break;

      case 'monthly':
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate);
          date.setMonth(date.getMonth() - i);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          groupedData[key] = {
            date: key,
            revenue: 0,
            orders: 0,
            users: 0
          };
        }
        break;

      case 'yearly':
        for (let i = 4; i >= 0; i--) {
          const year = currentDate.getFullYear() - i;
          groupedData[year] = {
            date: year.toString(),
            revenue: 0,
            orders: 0,
            users: 0
          };
        }
        break;
    }

    // Group orders by period if available
    if (orders && orders.length > 0) {
      orders.forEach(order => {
        const createdAt = new Date(order.createdAt);
        let key;

        switch (selectedPeriod) {
          case 'daily':
            key = createdAt.toISOString().split('T')[0];
            break;
          case 'monthly':
            key = `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, '0')}`;
            break;
          case 'yearly':
            key = createdAt.getFullYear().toString();
            break;
        }

        if (groupedData[key]) {
          groupedData[key].orders++;
          groupedData[key].revenue += order.total || 0;
        }
      });
    }

    // Distribute users across periods (estimation)
    const totalUsers = statsData.totalUsers;
    const periods = Object.keys(groupedData).length;
    const usersPerPeriod = Math.floor(totalUsers / periods);
    let remainingUsers = totalUsers % periods;

    Object.keys(groupedData).forEach((key, index) => {
      groupedData[key].users = usersPerPeriod + (remainingUsers > 0 ? 1 : 0);
      if (remainingUsers > 0) remainingUsers--;
    });

    // Convert to array and format for charts
    const formattedData = Object.values(groupedData).map(data => ({
      month: formatPeriodLabel(data.date),
      revenue: data.revenue,
      orders: data.orders,
      users: data.users
    }));

    setMonthlyData(formattedData);
  };

  // Helper function to format period labels
  const formatPeriodLabel = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    switch (selectedPeriod) {
      case 'daily':
        const [year, month, day] = date.split('-');
        return `${day}/${month}/${year}`;
      case 'monthly':
        const [y, m] = date.split('-');
        return `${months[parseInt(m) - 1]} ${y}`;
      case 'yearly':
        return date;
      default:
        return date;
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    generateMonthlyData(stats);
  }, [selectedPeriod, orders, stats]);

  // Process category data for pie chart - count products in each category
  const getCategoryData = () => {
    if (!stats.category || stats.category.length === 0 || !stats.products) {
      return [];
    }
    
    const colors = ['#FFD700', '#FFA500', '#FF8C00', '#FF7F50', '#FFB347', '#FFCC5C', '#FF9500'];
    
    // Count products in each active category
    const categoryCount = {};
    stats.products.forEach(product => {
      if (product.category && product.category.name) {
        const categoryName = product.category.name;
        categoryCount[categoryName] = (categoryCount[categoryName] || 0) + 1;
      }
    });

    // Get only active categories with product counts
    return stats.category
      .filter(cat => cat.status === 'active' && categoryCount[cat.name])
      .map((cat, index) => ({
        name: cat.name,
        value: categoryCount[cat.name] || 0,
        color: colors[index % colors.length]
      }))
      .filter(cat => cat.value > 0);
  };

  // Process order status data based on actual orders
  const getOrderStatusData = () => {
    if (!orders || orders.length === 0) {
      return [];
    }

    const statusCount = {};
    orders.forEach(order => {
      const status = order.currentStatus;
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusColors = {
      'Delivered': '#22C55E',
      'Payment Received': '#10B981',
      'Order Placed': '#F59E0B',
      'Processing': '#FFD700',
      'Shipped': '#3B82F6',
      'Cancelled': '#EF4444',
      'Pending': '#F59E0B'
    };

    return Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
      color: statusColors[status] || '#6B7280'
    }));
  };

  const StatCard = ({ title, value, icon: Icon, change, color = '#FFD700' }) => (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20 group">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className={`p-2 sm:p-3 rounded-lg bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 group-hover:from-yellow-400/30 group-hover:to-yellow-600/30 transition-all duration-300`}>
          <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-400" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${change > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {change > 0 ? <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ArrowDown className="w-3 h-3 sm:w-4 sm:h-4" />}
            <span className="text-xs sm:text-sm font-medium">{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1 sm:space-y-2">
        <h3 className="text-gray-400 text-xs sm:text-sm font-medium">{title}</h3>
        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors duration-300 break-all">
          {value}
        </p>
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-yellow-500 rounded-lg p-3 shadow-lg">
          <p className="text-yellow-400 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-white text-sm">
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const refreshData = () => {
    fetchDashboardData();
    fetchOrders();
    fetchUser();
  };

  if (isLoading) {
    return (
      <div className="w-[100vw] lg:w-[calc(100vw-256px)] p-4 sm:p-6 text-white overflow-y-auto min-h-screen bg-black">
        <div className="flex items-center justify-center h-full min-h-[60vh]">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 sm:w-12 sm:h-12 text-yellow-400 animate-spin mx-auto mb-4" />
            <p className="text-lg sm:text-xl text-gray-400">Loading Dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[100vw] lg:w-[calc(100vw-256px)] hidescroll p-4 sm:p-6 text-white overflow-y-auto h-screen bg-black">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4 mb-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-gray-400 mt-2 text-sm sm:text-base">Welcome back! Here's what's happening with your store.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 sm:px-4 text-white focus:border-yellow-500 focus:outline-none text-sm sm:text-base"
            >
              <option value="daily">Daily</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
            
            <button 
              onClick={() => {
                
                refreshData();
              }}
              className="bg-yellow-500 text-black px-3 py-2 sm:px-4 rounded-lg hover:bg-yellow-600 transition-colors text-sm sm:text-base"
            >
              <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 inline mr-2" />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} />
          <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingBag} />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue?.toLocaleString() || 0}`} icon={DollarSign} />
          <StatCard title="Products" value={stats.totalProducts} icon={Package} />
        </div>

        {/* Additional Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6">
          <StatCard title="Items Sold" value={stats.totalItemsSold} icon={TrendingUp} />
          <StatCard title="Total Stock" value={stats.totalStock} icon={Package} />
          <StatCard title="Out of Stock" value={stats.outOfStock} icon={Package} />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Monthly Performance */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">
                {selectedPeriod === 'daily' ? 'Daily' : 
                 selectedPeriod === 'monthly' ? 'Monthly' : 
                 'Yearly'} Performance
              </h3>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#FFD700" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-400">
                No data available
              </div>
            )}
          </div>

          {/* Category Distribution */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Category Distribution</h3>
              <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            {getCategoryData().length > 0 ? (
              <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
                <PieChart>
                  <Pie
                    data={getCategoryData()}
                    cx="50%"
                    cy="50%"
                    outerRadius={window.innerWidth < 640 ? 60 : 80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {getCategoryData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] sm:h-[300px] flex items-center justify-center text-gray-400">
                No category data available
              </div>
            )}
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Orders Trend */}
          <div className="xl:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Orders Trend</h3>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            <ResponsiveContainer width="100%" height={300} className="sm:h-[380px]">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="orders" fill="#FFD700" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Order Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-white">Order Status</h3>
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
            </div>
            {getOrderStatusData().length > 0 ? (
              <div className="space-y-3">
                {getOrderStatusData().map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      <div 
                        className="w-2 h-2 sm:w-3 sm:h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-gray-300 text-xs sm:text-sm truncate">{item.status}</span>
                    </div>
                    <span className="text-white font-medium text-sm">{item.count}</span>
                  </div>
                ))}
                <div className="mt-4 space-y-2">
                  {getOrderStatusData().map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-xs sm:text-sm">
                      <span className="text-gray-400 truncate flex-1">{item.status}</span>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <div className="w-16 sm:w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-300"
                            style={{ 
                              backgroundColor: item.color,
                              width: `${(item.count / orders.length) * 100}%`
                            }}
                          ></div>
                        </div>
                        <span className="text-gray-300 w-6 sm:w-8 text-right">
                          {Math.round((item.count / orders.length) * 100)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-400">
                No order data available
              </div>
            )}
          </div>
        </div>

        {/* Top Products Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Top Products</h3>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </button>
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Product</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Stock</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Price</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Sold</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Category</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.products && stats.products.length > 0 ? (
                  stats.products
                    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
                    .slice(0, 5)
                    .map((product) => (
                    <tr key={product._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                          <span className="text-white font-medium text-xs sm:text-sm truncate">{product.name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 text-gray-300 text-xs sm:text-sm">{product.stock || 0}</td>
                      <td className="py-3 sm:py-4 text-green-400 text-xs sm:text-sm">₹{(product.price || 0).toLocaleString()}</td>
                      <td className="py-3 sm:py-4 text-blue-400 text-xs sm:text-sm">{product.sold || 0}</td>
                      <td className="py-3 sm:py-4 text-gray-300 text-xs sm:text-sm truncate">{product.category?.name || 'N/A'}</td>
                      <td className="py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.stock > 0 ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                        }`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-400 text-sm">
                      No products available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-lg sm:text-xl font-semibold text-white">Recent Orders</h3>
            <div className="flex space-x-2">
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </button>
              <button className="p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors">
                <Download className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Order ID</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Customer</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Total</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Status</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Payment</th>
                  <th className="pb-3 text-gray-400 font-medium text-xs sm:text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders && orders.length > 0 ? (
                  orders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      <td className="py-3 sm:py-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></div>
                          <span className="text-white font-medium text-xs sm:text-sm truncate">{order.orderId}</span>
                        </div>
                      </td>
                      <td className="py-3 sm:py-4 text-gray-300 text-xs sm:text-sm truncate">{order.user?.name || 'N/A'}</td>
                      <td className="py-3 sm:py-4 text-green-400 text-xs sm:text-sm">₹{order.total?.toLocaleString() || 0}</td>
                      <td className="py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.currentStatus === 'Delivered' ? 'bg-green-900 text-green-300' :
                          order.currentStatus === 'Payment Received' ? 'bg-blue-900 text-blue-300' :
                          order.currentStatus === 'Order Placed' ? 'bg-yellow-900 text-yellow-300' :
                          order.currentStatus === 'Processing' ? 'bg-orange-900 text-orange-300' :
                          order.currentStatus === 'Shipped' ? 'bg-blue-900 text-blue-300' :
                          order.currentStatus === 'Cancelled' ? 'bg-red-900 text-red-300' :
                          'bg-gray-900 text-gray-300'
                        }`}>
                          {order.currentStatus}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'Completed' ? 'bg-green-900 text-green-300' :
                          order.paymentStatus === 'Pending' ? 'bg-yellow-900 text-yellow-300' :
                          'bg-red-900 text-red-300'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 sm:py-4 text-gray-300 text-xs sm:text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-4 text-center text-gray-400 text-sm">
                      No orders available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-white">Manage Users</h4>
                <p className="text-gray-400 text-xs sm:text-sm">View and manage user accounts</p>
                <p className="text-yellow-400 text-xs mt-1">{stats.totalUsers} users registered</p>
              </div>
            </div>
            <button onClick={()=> navigate('/admindashboard/viewusers')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-lg transition-colors text-sm sm:text-base">
              View Users
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <Package className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-white">Inventory</h4>
                <p className="text-gray-400 text-xs sm:text-sm">Manage products and stock</p>
                <p className="text-yellow-400 text-xs mt-1">{stats.totalProducts} products available</p>
              </div>
            </div>
            <button onClick={()=> navigate('/admindashboard/addproduct')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-lg transition-colors text-sm sm:text-base">
              Manage Inventory
            </button>
          </div>

          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-4 sm:p-6 hover:border-yellow-500 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-500/20">
            <div className="flex items-center space-x-3 mb-4">
              <ShoppingBag className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400 flex-shrink-0" />
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-semibold text-white">Orders</h4>
                <p className="text-gray-400 text-xs sm:text-sm">Process and track orders</p>
                <p className="text-yellow-400 text-xs mt-1">{orders.length} recent orders</p>
              </div>
            </div>
            <button onClick={()=> navigate('/admindashboard/manageorders')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-medium py-2 rounded-lg transition-colors text-sm sm:text-base">
              View Orders
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-green-500/20 rounded-xl">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
              </div>
              <span className="text-green-400 text-xs sm:text-sm font-medium">↑ {stats.totalOrders > 0 ? '+' : ''}
              {Math.round((stats.totalOrders / 30) * 100) / 100}%</span>
            </div>
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Monthly Growth</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {stats.totalOrders > 0 ? '+' : ''}
              {Math.round((stats.totalOrders / 30) * 100) / 100}%
            </p>
          </div>

          <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-blue-500/20 rounded-xl">
                <Users className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />
              </div>
              <span className="text-blue-400 text-xs sm:text-sm font-medium">Active</span>
            </div>
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Active Users</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {Math.round(stats.totalUsers )}
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-purple-500/20 rounded-xl">
                <Star className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <span className="text-purple-400 text-xs sm:text-sm font-medium">{avgRating}/5</span>
            </div>
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Avg Rating</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {avgRating}
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 bg-orange-500/20 rounded-xl">
                <Package className="w-4 h-4 sm:w-6 sm:h-6 text-orange-400" />
              </div>
              <span className="text-orange-400 text-xs sm:text-sm font-medium">Stock</span>
            </div>
            <h3 className="text-gray-400 text-xs sm:text-sm font-medium mb-2">Low Stock Items</h3>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
              {stats.products.filter(product => product.stock < (product.lowStockThreshold || 5)).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;