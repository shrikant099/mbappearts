import React, { useEffect, useState, useRef } from 'react';
import { apiConnector } from '../services/apiConnector';
import { endpoints } from '../services/api';
import { toast } from 'react-hot-toast';
import { Eye, X, Search, Users } from 'lucide-react';
import { useSelector } from 'react-redux';

const ViewUsers = () => {
  const [allUsers, setAllUsers] = useState([]); // All users from API
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users for display
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const token = useSelector(state => state.auth.token);

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      
      const res = await apiConnector(
        "GET",
        `${endpoints.getUser}?page=${page}&limit=15`,
        null,
        {
          Authorization: `Bearer ${token}`
        }
      );

      console.log('API Response:', res);

      if (res.data.success) {
        const users = res.data.users || [];
        setAllUsers(users);
        setFilteredUsers(users); // Initially show all users
        setCurrentPage(res.data.currentPage || page);
        setTotalPages(res.data.totalPages || 1);
        setTotalUsers(res.data.totalUsers || 0);
      } else {
        console.error('API returned unsuccessful response:', res.data);
        toast.error(res.data.message || "Failed to load users");
        setAllUsers([]);
        setFilteredUsers([]);
        setTotalPages(1);
        setCurrentPage(1);
        setTotalUsers(0);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error("Unable to fetch users");
      setAllUsers([]);
      setFilteredUsers([]);
      setTotalPages(1);
      setCurrentPage(1);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    if (token) {
      fetchUsers(1);
    }
  }, [token]);

  // Client-side filtering effect
  useEffect(() => {
    if (!searchQuery.trim()) {
      // If no search query, show all users
      setFilteredUsers(allUsers);
    } else {
      // Filter users based on search query
      const filtered = allUsers.filter(user => {
        const name = user.name ? user.name.toLowerCase() : '';
        const phone = user.phone ? String(user.phone).toLowerCase() : '';
        const searchTerm = searchQuery.toLowerCase();
        
        return name.includes(searchTerm) || phone.includes(searchTerm);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, allUsers]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-[#fafafa] h-screen overflow-y-scroll hidescroll w-[100vw] lg:w-[1600px] text-black">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#222] flex items-center justify-center gap-2">
            <Users className="text-[#FFD770]" size={28} />
            All Users
          </h1>
        </div>

        {/* Search Bar */}
        <div className="mb-4 sm:mb-6 max-w-md mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name or phone number on this page..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-10 py-2 sm:py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770] focus:border-transparent transition duration-200 shadow-sm text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition"
              >
                <X size={18} />
              </button>
            )}
          </div>

          {/* Search Results Summary */}
          {!loading && (
            <div className="mt-2 text-xs sm:text-sm text-gray-600 text-center">
              {searchQuery.trim() ? (
                filteredUsers.length > 0 ? (
                  <span className="text-green-600">
                    Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} matching "{searchQuery}" on this page
                  </span>
                ) : (
                  <span className="text-red-600">
                    No users found matching "{searchQuery}" on this page
                  </span>
                )
              ) : (
                <span className="text-gray-500">
                  Showing {allUsers.length} users on page {currentPage}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden lg:block overflow-x-auto shadow-lg rounded-lg mb-6">
          <table className="min-w-[700px] w-full bg-white rounded">
            <thead className="bg-[#FFD770] text-[#222]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Sr. No.</th>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Phone</th>
                <th className="px-4 py-3 text-left font-semibold">Orders</th>
                <th className="px-4 py-3 text-left font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-[#FFD770] border-t-transparent mr-2"></div>
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, idx) => {
                  // Calculate the actual serial number based on current page and original position
                  const originalIndex = allUsers.findIndex(u => u._id === user._id);
                  const serialNumber = (currentPage - 1) * 10 + originalIndex + 1;
                  
                  return (
                    <tr key={user._id} className="border-t hover:bg-[#f5f5f5] transition duration-300">
                      <td className="px-4 py-3">{serialNumber}</td>
                      <td className="px-4 py-3 font-medium">
                        {/* Highlight search term in name */}
                        {searchQuery && user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: user.name.replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }}
                          />
                        ) : (
                          user.name
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {/* Highlight search term in phone */}
                        {searchQuery && user.phone && String(user.phone).toLowerCase().includes(searchQuery.toLowerCase()) ? (
                          <span
                            dangerouslySetInnerHTML={{
                              __html: String(user.phone).replace(
                                new RegExp(`(${searchQuery})`, 'gi'),
                                '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                              )
                            }}
                          />
                        ) : (
                          user.phone
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium">
                          {user.totalOrders || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="bg-[#FFD770] text-black px-3 py-2 rounded-md hover:brightness-110 transition hover:scale-105 flex items-center gap-1 font-medium"
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="px-4 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <Users size={48} className="text-gray-300 mb-2" />
                      <p className="text-lg font-medium">No users found</p>
                      {searchQuery ? (
                        <div className="text-sm space-y-1">
                          <p>No users match your search: "<strong>{searchQuery}</strong>" on this page</p>
                          <p className="text-gray-400">Try clearing the search or check other pages</p>
                        </div>
                      ) : (
                        <p className="text-sm">No users are available on this page</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View - Hidden on desktop */}
        <div className="lg:hidden mb-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#FFD770] border-t-transparent mr-3"></div>
              <span className="text-gray-600">Loading users...</span>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="space-y-4">
              {filteredUsers.map((user, idx) => {
                const originalIndex = allUsers.findIndex(u => u._id === user._id);
                const serialNumber = (currentPage - 1) * 10 + originalIndex + 1;
                
                return (
                  <div key={user._id} className="bg-white rounded-lg shadow-lg p-5 border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded font-medium">#{serialNumber}</span>
                          <span className="bg-[#FFD770] text-black px-2 py-1 rounded text-xs font-medium">
                            {user.totalOrders || 0} Orders
                          </span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-800 mb-1">
                          {searchQuery && user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: user.name.replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                )
                              }}
                            />
                          ) : (
                            user.name
                          )}
                        </h3>
                        <p className="text-gray-600 text-lg font-medium">
                          {searchQuery && user.phone && String(user.phone).toLowerCase().includes(searchQuery.toLowerCase()) ? (
                            <span
                              dangerouslySetInnerHTML={{
                                __html: String(user.phone).replace(
                                  new RegExp(`(${searchQuery})`, 'gi'),
                                  '<mark class="bg-yellow-200 px-1 rounded">$1</mark>'
                                )
                              }}
                            />
                          ) : (
                            user.phone
                          )}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        className="w-full bg-[#FFD770] text-black py-3 px-4 rounded-md hover:brightness-110 transition font-medium flex items-center justify-center gap-2"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye size={18} />
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-lg p-8 text-center border border-gray-200">
              <Users size={48} className="text-gray-300 mb-4 mx-auto" />
              <p className="text-lg font-medium text-gray-700 mb-2">No users found</p>
              {searchQuery ? (
                <div className="text-sm space-y-1 text-gray-500">
                  <p>No users match your search: "<strong>{searchQuery}</strong>" on this page</p>
                  <p className="text-gray-400">Try clearing the search or check other pages</p>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No users are available on this page</p>
              )}
            </div>
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && !loading && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6">
            <button
              className="px-4 py-2 bg-[#FFD770] text-black rounded-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium w-full sm:w-auto"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Previous
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-center">
              {/* Page numbers */}
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={i}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-2 rounded-md transition font-medium text-sm ${
                      currentPage === pageNum
                        ? 'bg-[#FFD770] text-black shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="px-4 py-2 bg-[#FFD770] text-black rounded-md hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 font-medium w-full sm:w-auto"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
            </button>
          </div>
        )}

        <div className="text-center mt-4 text-xs sm:text-sm text-gray-600">
          {!loading && (
            <p>
              {searchQuery ? (
                <>Showing {filteredUsers.length} of {allUsers.length} users on page {currentPage} (filtered)</>
              ) : (
                <>Showing {allUsers.length} users on page {currentPage} of {totalPages}</>
              )}
            </p>
          )}
        </div>
      </div>

      {/*  || 'N/A' */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-[#111] text-[#FFD770] max-w-xl w-full rounded-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh] shadow-[0_0_20px_rgba(255,215,112,0.3)] animate-scale-in border border-[#FFD770]/30">
            <div className="flex justify-between items-center mb-4 border-b border-[#FFD770]/20 pb-2">
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide">User Details</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-[#FFD770] hover:text-white hover:bg-[#FFD770]/20 p-2 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm sm:text-base tracking-wide leading-relaxed">
  <p><span className="font-semibold">Name:</span> {selectedUser?.name || 'N/A'}</p>
  <p><span className="font-semibold">Phone:</span> {selectedUser?.phone || 'N/A'}</p>
  <p><span className="font-semibold">Total Orders:</span> {selectedUser?.totalOrders || 0}</p>
  <p><span className="font-semibold">Total Spent:</span> ₹{selectedUser?.totalSpent ? selectedUser.totalSpent.toLocaleString() : '0'}</p>

  {selectedUser?.profile ? (
    <>
      <p><span className="font-semibold">Age:</span> {selectedUser.profile.age || 'N/A'}</p>
      <p><span className="font-semibold">Gender:</span> {selectedUser.profile.gender || 'N/A'}</p>
      <p>
        <span className="font-semibold">DOB:</span> {
          selectedUser.profile.dateOfBirth 
            ? new Date(selectedUser.profile.dateOfBirth).toLocaleDateString('en-IN')
            : 'N/A'
        }
      </p>
      <p><span className="font-semibold">Occupation:</span> {selectedUser.profile.occupation || 'N/A'}</p>
      <p><span className="font-semibold">Bio:</span> {selectedUser.profile.bio || 'N/A'}</p>
      
      <div>
        <span className="font-semibold">Address:</span>
        <p className="ml-2 mt-1 text-[#FFD770]/90 leading-normal">
          {[
            selectedUser.profile.address,
            selectedUser.profile.city,
            selectedUser.profile.state,
            selectedUser.profile.zipCode,
            selectedUser.profile.country
          ].filter(Boolean).join(', ') || 'N/A'}
        </p>
      </div>
    </>
  ) : (
    <p className="italic text-[#FFD770]/70">No profile information available.</p>
  )}
</div>

          </div>

          {/* Custom Animation */}
          <style jsx>{`
            @keyframes scale-in {
              0% { transform: scale(0.92); opacity: 0; }
              100% { transform: scale(1); opacity: 1; }
            }
            .animate-scale-in {
              animation: scale-in 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default ViewUsers;