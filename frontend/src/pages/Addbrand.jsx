import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import { useDispatch, useSelector } from "react-redux";
import { apiConnector } from "../services/apiConnector";
import { setLoading } from "../slices/authSlice";
import { brandEndpoints } from "../services/api";
import toast from "react-hot-toast";
import { PlusCircle, Search, X, Edit, Trash2, Globe, Sparkles, AlertCircle, Bookmark, Text, Hash, Loader2 } from 'lucide-react'; // Added icons

const { getAllBrands, createBrand, updateBrand, deleteBrand } = brandEndpoints;

const Brands = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const token = useSelector((state) => state.auth.token);

  const [brands, setBrands] = useState([]);
  const [filteredBrands, setFilteredBrands] = useState([]); // State for filtered brands
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: { url: "", altText: "" },
    website: "",
    isFeatured: false,
    status: "active",
    metaTitle: "",
    metaDescription: "",
    seoKeywords: "",
  });

  // useCallback for fetchBrands to prevent unnecessary re-renders in useEffect
  const fetchBrands = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllBrands, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data.success) {
        setBrands(res.data.brands);
        setFilteredBrands(res.data.brands); // Initialize filtered brands
      }
    } catch (err) { // Catch the error object for more detail
      console.error("Error fetching brands:", err);
      toast.error("Failed to load brands");
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, token]); // Dependencies for useCallback

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]); // fetchBrands is now a stable dependency

  // Effect for filtering brands based on searchTerm
  useEffect(() => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const filtered = brands.filter((b) =>
      `${b.name} ${b.slug} ${b.status} ${b.description} ${b.metaTitle} ${b.metaDescription} ${b.seoKeywords}`
        .toLowerCase()
        .includes(lowercasedSearchTerm)
    );
    setFilteredBrands(filtered);
  }, [searchTerm, brands]); // Re-filter when searchTerm or original brands change

  const handleEditOpen = (brand) => {
    setEditId(brand._id);
    setFormData({
      name: brand.name || "",
      slug: brand.slug || "",
      description: brand.description || "",
      logo: {
        url: brand.logo?.url || "",
        altText: brand.logo?.altText || "",
      },
      website: brand.website || "",
      isFeatured: brand.isFeatured || false,
      status: brand.status || "active",
      metaTitle: brand.metaTitle || "",
      metaDescription: brand.metaDescription || "",
      seoKeywords: brand.seoKeywords?.join(", ") || "",
    });
    setEditing(true);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditing(false);
    setEditId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo: { url: "", altText: "" },
      website: "",
      isFeatured: false,
      status: "active",
      metaTitle: "",
      metaDescription: "",
      seoKeywords: "",
    });
  };

  const handleDelete = async (id) => {
    try {
      const confirmed = window.confirm("Are you sure you want to delete this brand?");
      if (!confirmed) return;

      dispatch(setLoading(true)); // Start loading when confirmation is given
      const res = await apiConnector("DELETE", `${deleteBrand}${id}`, null, {
        Authorization: `Bearer ${token}`
      });
      if (res.data.success) {
        toast.success("Brand deleted successfully");
        fetchBrands(); // Refresh list
      } else {
        toast.error("Deletion failed");
      }
    } catch (err) {
      console.error(err); // Log the actual error object
      toast.error(err.response?.data?.message || "Unable to delete brand"); // Better error message
    } finally {
      dispatch(setLoading(false)); // Always stop loading
    }
  };


  const handleSave = async () => {
    try {
      dispatch(setLoading(true));
      const payload = {
        ...formData,
        seoKeywords: formData.seoKeywords
          .split(",")
          .map((kw) => kw.trim())
          .filter(kw => kw !== ""), // Ensure empty strings from split are removed
      };

      const endpoint = editing ? `${updateBrand}${editId}` : createBrand;
      const method = editing ? "PUT" : "POST";

      const res = await apiConnector(method, endpoint, payload, {
        Authorization: `Bearer ${token}`
      });
      if (res.data.success) {
        toast.success(`Brand ${editing ? "updated" : "created"}!`);
        handleModalClose();
        fetchBrands();
      } else {
        // Provide more specific error if backend sends one
        toast.error(res.data?.message || "Something went wrong during save");
      }
    } catch (err) {
      console.error(err); // Log the actual error object
      toast.error(err.response?.data?.message || "Brand save failed"); // Better error message
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen w-[100vw] lg:w-[calc(100vw-256px)] h-[100vh] overflow-scroll hidescroll bg-gray-50 text-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
            <Bookmark className="text-[#FFD770]" size={36} />
            Manage Brands
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-[#FFD770] text-black px-6 py-3 rounded-lg shadow-md hover:brightness-110 transition duration-300 flex items-center gap-2 font-semibold text-lg"
          >
            <PlusCircle size={20} />
            Add New Brand
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-6 relative max-w-lg mx-auto md:mx-0">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search brands by name, slug, or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-12 pr-10 py-3 border border-gray-300 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FFD770] focus:border-transparent transition duration-200 shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex justify-center items-center h-60">
            <Loader2 className="animate-spin h-10 w-10 text-[#FFD770]" />
          </div>
        ) : (
          <>
            {/* Desktop Table (lg and up) */}
            <div className="hidden lg:block overflow-x-auto rounded-lg shadow-xl border border-gray-200">
              <table className="min-w-full bg-white divide-y divide-gray-200">
                <thead className="bg-[#FFD770] text-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Slug</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Website</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Featured</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBrands.length > 0 ? (
                    filteredBrands.map((b) => (
                      <tr key={b._id} className="hover:bg-gray-50 transition duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          <div className="flex items-center gap-3">
                            
                            <span>{b.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{b.slug}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {b.website ? (
                            <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                              <Globe size={16} /> Visit Site
                            </a>
                          ) : (
                            <span className="text-gray-500 italic">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {b.isFeatured ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              <Sparkles size={14} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm capitalize">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            b.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditOpen(b)}
                              className="inline-flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 text-sm gap-1"
                              title="Edit Brand"
                            >
                              <Edit size={16} /> Edit
                            </button>
                            <button
                              onClick={() => handleDelete(b._id)}
                              className="inline-flex items-center px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200 text-sm gap-1"
                              title="Delete Brand"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <AlertCircle size={48} className="text-gray-300 mb-2" />
                          <p className="text-lg font-medium">No brands found</p>
                          {searchTerm ? (
                            <p className="text-sm">No brands match your search "{searchTerm}"</p>
                          ) : (
                            <p className="text-sm">Start by adding a new brand</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards (sm to lg) */}
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredBrands.length > 0 ? (
                filteredBrands.map((b) => (
                  <div key={b._id} className="bg-white rounded-lg shadow-md p-4 border border-gray-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        
                        <h3 className="text-lg font-bold text-gray-800">{b.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Hash size={16} className="text-gray-500"/>
                        <span className="font-medium">Slug:</span> {b.slug}
                      </p>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Globe size={16} className="text-gray-500"/>
                        <span className="font-medium">Website:</span>{" "}
                        {b.website ? (
                          <a href={b.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            {b.website.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0]}
                          </a>
                        ) : (
                          <span className="italic">N/A</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <Sparkles size={16} className="text-gray-500"/>
                        <span className="font-medium">Featured:</span>{" "}
                        {b.isFeatured ? (
                          <span className="text-yellow-700">Yes</span>
                        ) : (
                          <span className="text-gray-500">No</span>
                        )}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                        <AlertCircle size={16} className="text-gray-500"/>
                        <span className="font-medium">Status:</span>{" "}
                        <span className={`capitalize ${
                          b.status === 'active' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {b.status}
                        </span>
                      </p>
                    </div>
                    <div className="flex justify-end gap-2 mt-4">
                      <button
                        onClick={() => handleEditOpen(b)}
                        className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-md hover:bg-blue-600 transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <Edit size={16} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="flex-1 bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 transition-colors duration-200 flex items-center justify-center gap-1 text-sm"
                      >
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
                  <div className="flex flex-col items-center">
                    <AlertCircle size={48} className="text-gray-300 mb-2" />
                    <p className="text-lg font-medium">No brands found</p>
                    {searchTerm ? (
                      <p className="text-sm">No brands match your search "{searchTerm}"</p>
                    ) : (
                      <p className="text-sm">Start by adding a new brand</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Modal */}
        {showModal && (
          <div className="hidescroll fixed inset-0 z-[151]  bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white text-gray-900 p-6 hidescroll rounded-xl shadow-2xl max-w-xl w-[95%] max-h-[90vh] overflow-y-auto transform scale-95 opacity-0 animate-modal-in border border-[#FFD770]/30">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editing ? "Edit Brand" : "Add New Brand"}
                </h2>
                <button
                  onClick={handleModalClose}
                  className="text-gray-500 hover:text-gray-800 p-2 rounded-full transition-colors duration-200"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {/* Basic Info */}
                <h3 className="text-lg font-semibold mt-2 text-[#FFD770]">Basic Information</h3>
                <input
                  type="text"
                  placeholder="Brand Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                  required
                />
                <input
                  type="text"
                  placeholder="Slug (e.g., nike-brand)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                  required
                />
                <textarea
                  placeholder="Brand Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />
                <input
                  type="url"
                  placeholder="Official Website URL"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />

                {/* Logo Fields */}
                <h3 className="text-lg font-semibold mt-4 text-[#FFD770]">Brand Logo</h3>
                <input
                  type="url"
                  placeholder="Logo URL (e.g., https://example.com/logo.png)"
                  value={formData.logo.url}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logo: { ...formData.logo, url: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />
                <input
                  type="text"
                  placeholder="Logo Alt Text (e.g., Nike Logo)"
                  value={formData.logo.altText}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      logo: { ...formData.logo, altText: e.target.value },
                    })
                  }
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />

                {/* SEO Fields */}
                <h3 className="text-lg font-semibold mt-4 text-[#FFD770]">SEO Information</h3>
                <input
                  type="text"
                  placeholder="Meta Title"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />
                <textarea
                  placeholder="Meta Description"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                  rows="2"
                  className="w-full p-3 border border-gray-300 rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />
                <input
                  type="text"
                  placeholder="SEO Keywords (comma separated, e.g., fashion, streetwear, shoes)"
                  value={formData.seoKeywords}
                  onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200"
                />

                {/* Featured and Status */}
                <h3 className="text-lg font-semibold mt-4 text-[#FFD770]">Settings</h3>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) =>
                        setFormData({ ...formData, isFeatured: e.target.checked })
                      }
                      className="form-checkbox h-5 w-5 text-[#FFD770] rounded border-gray-300 focus:ring-[#FFD770]"
                    />
                    <span className="text-gray-700">Mark as Featured</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <label htmlFor="status-select" className="text-gray-700">Status:</label>
                    <select
                      id="status-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })} // Corrected: e.target.value
                      className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFD770]/60 transition-colors duration-200 bg-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={handleModalClose}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors duration-200 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-[#FFD770] text-black font-semibold rounded-lg hover:brightness-110 transition duration-300 min-w-[120px] flex justify-center items-center gap-2"
                  disabled={loading} // Disable button while saving
                >
                  {loading ? (
                    <Loader2 className="animate-spin h-5 w-5 text-black" />
                  ) : (
                    <>Save Brand</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Styles for Animation and Scrollbar */}
      <style jsx>{`
        /* Hide scrollbar for webkit browsers */
        .hidescroll::-webkit-scrollbar {
          display: none;
        }
        /* Hide scrollbar for IE, Edge and Firefox */
        .hidescroll {
          -ms-overflow-style: none;  /* IE and Edge */
          scrollbar-width: none;  /* Firefox */
        }

        @keyframes modal-in {
          0% { transform: scale(0.95); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-modal-in {
          animation: modal-in 0.2s ease-out forwards;
        }

        /* Spinner for Save button */
        .loader1 {
          width: 1.5rem;
          height: 1.5rem;
          border: 2px solid rgba(0, 0, 0, 0.2);
          border-top-color: black;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default Brands;