import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../slices/authSlice";
import { apiConnector } from "../services/apiConnector";
import {
  brandEndpoints,
  categoryEndpoints,
  productEndpoints,
} from "../services/api";
import toast from "react-hot-toast";

const { getAllCategory } = categoryEndpoints;
const { createProduct, getAllProduct, updateProduct, deleteProduct } =
  productEndpoints;
const { getAllBrands } = brandEndpoints;

const AddProduct = () => {
  const dispatch = useDispatch();
  const loading = useSelector((state) => state.auth.loading);
  const token = useSelector(state => state.auth.token)

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    shortDescription: "",
    price: "",
    comparePrice: "",
    costPerItem: "",
    stock: "",
    category: "",
    subCategory: "",
    brand: "",
    size: [],
    color: [],
    material: "",
    fabric: "",
    fit: "",
    sleeveLength: "",
    pattern: "",
    occasion: "",
    season: "",
    gender: "",
    status: "active",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
    saleStartDate: "",
    saleEndDate: "",
    lookbookImages: [],
  });

  const [imageInputs, setImageInputs] = useState([0]);
  const [images, setImages] = useState({});

  // Available options for sizes and colors
  const sizeOptions = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "One Size", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  const colorOptions = [
    "Red", "Blue", "Green", "Yellow", "Black", "White", "Gray", "Brown", 
    "Orange", "Purple", "Pink", "Navy", "Maroon", "Olive", "Teal", "Silver",
    "Gold", "Beige", "Cream", "Tan", "Coral", "Mint", "Lavender", "Peach"
  ];

  const getAllCategories = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllCategory,null,{
        Authorization : `Bearer ${token}`
      });
      setCategories(res.data);
      toast.success("Categories loaded!");
    } catch {
      toast.error("Unable to fetch categories");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const getAllProducts = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllProduct,null,{
        Authorization : `Bearer ${token}`
      });
      console.log("Products fetched :", res);
      setProducts(res.data.products);
      setFiltered(res.data.products);
      toast.success("Products loaded!");
    } catch {
      toast.error("Unable to fetch products");
    } finally {
      dispatch(setLoading(false));
    }
  };
  const [brands, setBrands] = useState([]);

  const fetchBrands = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllBrands,null,{
        Authorization : `Bearer ${token}`
      });
      console.log("Brands fetched:", res);
      if (res.data.success) setBrands(res.data.brands);
    } catch {
      toast.error("Failed to load brands");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllCategories();
    getAllProducts();
    fetchBrands();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    if (Array.isArray(products)) {
      const filteredProducts = products.filter((prod) =>
        `${prod.name} ${prod.stock} ${prod.sold} ${prod.category?.name} ${prod.brand?.name}`
          .toLowerCase()
          .includes(term)
      );
      setFiltered(filteredProducts);
    }
  }, [searchTerm, products]);

  const handleSingleImageChange = (e, index) => {
    const file = e.target.files[0];
    setImages((prev) => ({ ...prev, [index]: file }));
  };

  const handleDeleteProduct = async (id) => {
    try {
      dispatch(setLoading(true));
      const confirm = window.confirm(
        "Are you sure you want to delete this product?"
      );
      if (!confirm) return;

      const res = await apiConnector("DELETE", `${deleteProduct}${id}`,null,{
        Authorization : `Bearer ${token}`
      });
      if (res.data.success) {
        toast.success("Product deleted successfully!");
        getAllProducts(); // Refresh table
      } else {
        toast.error("Deletion failed");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleAddMoreImages = () => {
    setImageInputs((prev) => [...prev, prev.length]);
  };

  // Handle size selection
  const handleSizeChange = (size) => {
    setFormData(prev => ({
      ...prev,
      size: prev.size.includes(size) 
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  // Handle color selection
  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color: prev.color.includes(color) 
        ? prev.color.filter(c => c !== color)
        : [...prev.color, color]
    }));
  };

  // Format date for input field (convert from ISO to YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const handleSubmit = async (edit = false) => {
    try {
      dispatch(setLoading(true));
      
      // Validation for sale dates
      if (formData.isOnSale) {
        if (!formData.saleStartDate || !formData.saleEndDate) {
          toast.error("Please provide both sale start and end dates when marking as on sale");
          dispatch(setLoading(false));
          return;
        }
        
        const startDate = new Date(formData.saleStartDate);
        const endDate = new Date(formData.saleEndDate);
        
        if (startDate >= endDate) {
          toast.error("Sale end date must be after start date");
          dispatch(setLoading(false));
          return;
        }
      }
      
      const payload = new FormData();
      const numericFields = ["price", "comparePrice", "costPerItem", "stock"];

      Object.entries(formData).forEach(([key, value]) => {
        if (numericFields.includes(key)) {
          const numVal = Number(value);
          if (isNaN(numVal)) throw new Error(`Invalid ${key} value`);
          payload.append(key, numVal);
        } else if (Array.isArray(value)) {
          // Handle arrays (size, color, etc.)
          value.forEach((v) => payload.append(key, v));
        } else if (key === 'saleStartDate' || key === 'saleEndDate') {
          // Handle date fields - only append if isOnSale is true and dates are provided
          if (formData.isOnSale && value) {
            payload.append(key, new Date(value).toISOString());
          }
        } else {
          payload.append(key, value);
        }
      });

      Object.values(images).forEach((file) => {
        payload.append("images", file);
      });

      const endpoint = edit ? `${updateProduct}${editId}` : createProduct;
      const method = edit ? "PUT" : "POST";

      const response = await apiConnector(method, endpoint, payload, {
        "Content-Type": "multipart/form-data",
        Authorization : `Bearer ${token}`
      });

      console.log("response for submit is ", response);

      toast.success(edit ? "Product updated!" : "Product created!");
      setShowAddModal(false);
      setShowEditModal(false);
      setImageInputs([0]);
      setImages({});
      getAllProducts();
    } catch (err) {
      console.log(err);
      toast.error(err.message || "Operation failed!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleEditOpen = (prod) => {
    setEditId(prod._id);
    setFormData({
      name: prod.name || "",
      description: prod.description || "",
      shortDescription: prod.shortDescription || "",
      price: prod.price || "",
      comparePrice: prod.comparePrice || "",
      costPerItem: prod.costPerItem || "",
      stock: prod.stock || "",
      category: prod.category?._id || "",
      subCategory: prod.subCategory || "",
      brand: prod.brand?._id || "",
      size: Array.isArray(prod.size) ? prod.size : [],
      color: Array.isArray(prod.color) ? prod.color : [],
      material: prod.material || "",
      fabric: prod.fabric || "",
      fit: prod.fit || "",
      sleeveLength: prod.sleeveLength || "",
      pattern: prod.pattern || "",
      occasion: prod.occasion || "",
      season: prod.season || "",
      gender: prod.gender || "",
      status: prod.status || "active",
      isFeatured: prod.isFeatured || false,
      isNewArrival: prod.isNewArrival || false,
      isBestSeller: prod.isBestSeller || false,
      isOnSale: prod.isOnSale || false,
      saleStartDate: formatDateForInput(prod.saleStartDate) || "",
      saleEndDate: formatDateForInput(prod.saleEndDate) || "",
      lookbookImages: prod.lookbookImages || [],
    });
    setImages({});
    setImageInputs([0]);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      shortDescription: "",
      price: "",
      comparePrice: "",
      costPerItem: "",
      stock: "",
      category: "",
      subCategory: "",
      brand: "",
      size: [],
      color: [],
      material: "",
      fabric: "",
      fit: "",
      sleeveLength: "",
      pattern: "",
      occasion: "",
      season: "",
      gender: "",
      status: "active",
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isOnSale: false,
      saleStartDate: "",
      saleEndDate: "",
      lookbookImages: [],
    });
    setImages({});
    setImageInputs([0]);
  };

  return (
    <div className="w-[100vw] lg:w-[calc(100vw-256px)] p-3 sm:p-6 text-black overflow-y-auto min-h-[100vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl sm:text-2xl font-semibold">Manage Products</h2>
        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="bg-[#FFD770] text-black px-4 py-2 rounded shadow-lg hover:brightness-110 transition w-full sm:w-auto text-center"
        >
          + Add Product
        </button>
      </div>

      <input
        type="text"
        placeholder="Search by name, category, brand..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="mb-4 w-full p-3 border rounded text-sm"
      />

      {loading ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden lg:block overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-[700px] w-full bg-white rounded">
              <thead className="bg-[#FFD770]">
                <tr>
                  <th className="px-4 py-2 text-left">Sr. No.</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Price</th>
                  <th className="px-4 py-2 text-left">Stock</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Brand</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(filtered) && filtered.length > 0 ? (
                  filtered.map((prod, idx) => (
                    <tr key={prod._id} className="border-t">
                      <td className="px-4 py-2">{idx + 1}</td>
                      <td className="px-4 py-2">{prod.name}</td>
                      <td className="px-4 py-2">₹{prod.price}</td>
                      <td className="px-4 py-2">{prod.stock}</td>
                      <td className="px-4 py-2">{prod.category?.name}</td>
                      <td className="px-4 py-2">{prod.brand?.name}</td>
                      <td className="px-4 py-2 capitalize">{prod.status}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button
                          className="bg-[#FFD770] text-black px-3 py-1 rounded hover:brightness-110"
                          onClick={() => handleEditOpen(prod)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                          onClick={() => handleDeleteProduct(prod._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile/Tablet Card View - Hidden on desktop */}
          <div className="lg:hidden space-y-4">
            {Array.isArray(filtered) && filtered.length > 0 ? (
              filtered.map((prod, idx) => (
                <div key={prod._id} className="bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">#{idx + 1}</span>
                        <span className={`text-xs px-2 py-1 rounded capitalize ${
                          prod.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {prod.status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">{prod.name}</h3>
                      <p className="text-2xl font-bold text-green-600">₹{prod.price}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Stock:</span>
                      <p className="font-medium">{prod.stock}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Category:</span>
                      <p className="font-medium">{prod.category?.name || "N/A"}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Brand:</span>
                      <p className="font-medium">{prod.brand?.name || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-3 border-t">
                    <button
                      className="flex-1 bg-[#FFD770] text-black py-2 px-4 rounded hover:brightness-110 transition font-medium"
                      onClick={() => handleEditOpen(prod)}
                    >
                      Edit
                    </button>
                    <button
                      className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition font-medium"
                      onClick={() => handleDeleteProduct(prod._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <p className="text-gray-500 text-lg">No products found</p>
              </div>
            )}
          </div>
        </>
      )}

      {(showAddModal || showEditModal) && (
        <div className="fixed z-[151] inset-0 bg-black/80 backdrop-blur-md flex justify-center items-center p-2 sm:p-4">
          <div className="bg-[#111] text-[#FFD770] p-4 sm:p-6 rounded-xl max-w-4xl w-full hidescroll max-h-[95vh] overflow-y-auto shadow-[0_0_20px_rgba(255,215,112,0.3)] animate-fade-in border border-[#FFD770]/30 transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center uppercase">
              {showAddModal ? "Add Product" : "Edit Product"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {/* Text Inputs */}
              {[
                "name",
                "shortDescription",
                "price",
                "comparePrice",
                "costPerItem",
                "stock",
                "material",
                "fabric",
                "pattern",
                "occasion",
              ].map((key) => (
                <input
                  key={key}
                  type={
                    ["price", "stock", "comparePrice", "costPerItem"].includes(
                      key
                    )
                      ? "number"
                      : "text"
                  }
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
                />
              ))}

              {/* Size Selection */}
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleSizeChange(size)}
                      className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                        formData.size.includes(size)
                          ? 'bg-[#FFD770] text-black border-[#FFD770]'
                          : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                  Selected: {formData.size.length > 0 ? formData.size.join(', ') : 'None'}
                </div>
              </div>

              {/* Color Selection */}
              <div className="sm:col-span-2">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleColorChange(color)}
                      className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                        formData.color.includes(color)
                          ? 'bg-[#FFD770] text-black border-[#FFD770]'
                          : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                  Selected: {formData.color.length > 0 ? formData.color.join(', ') : 'None'}
                </div>
              </div>

              {/* Dropdowns */}
              {[
                {
                  label: "Fit",
                  value: formData.fit,
                  options: ["Slim", "Regular", "Oversized", "Relaxed"],
                  key: "fit",
                },
                {
                  label: "Sleeve Length",
                  value: formData.sleeveLength,
                  options: ["Short", "Half", "Long", "Sleeveless"],
                  key: "sleeveLength",
                },
                {
                  label: "Season",
                  value: formData.season,
                  options: ["Summer", "Winter", "Spring", "Fall", "All Season"],
                  key: "season",
                },
                {
                  label: "Gender",
                  value: formData.gender,
                  options: ["Men", "Women", "Unisex", "Kids", "Boys", "Girls"],
                  key: "gender",
                },
              ].map((dropdown) => (
                <select
                  key={dropdown.key}
                  value={dropdown.value}
                  onChange={(e) =>
                    setFormData({ ...formData, [dropdown.key]: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md focus:outline-none text-sm sm:text-base"
                >
                  <option className="bg-black" value="">Select {dropdown.label}</option>
                  {dropdown.options.map((opt) => (
                    <option className="bg-black" key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ))}

              {/* Brands */}
              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm sm:text-base"
              >
                <option className="bg-black"  value="">Select Brand</option>
                {brands.map((b) => (
                  <option className="bg-black"  key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Category */}
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value,
                    subCategory: e.target.value,
                  })
                }
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm sm:text-base"
              >
                <option className="bg-black"  value="">Select Category</option>
                {categories.map((cat) => (
                  <option  className="bg-black" key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="mt-4 w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none h-20 sm:h-24 text-sm sm:text-base"
            />

            {/* Boolean Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
              {["isFeatured", "isNewArrival", "isBestSeller"].map(
                (flag) => (
                  <label key={flag} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData[flag]}
                      onChange={(e) =>
                        setFormData({ ...formData, [flag]: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    <span className="text-sm sm:text-base">{flag}</span>
                  </label>
                )
              )}
              
              {/* Special handling for isOnSale checkbox */}
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isOnSale}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    setFormData({ 
                      ...formData, 
                      isOnSale: isChecked,
                      // Clear dates if unchecking
                      saleStartDate: isChecked ? formData.saleStartDate : "",
                      saleEndDate: isChecked ? formData.saleEndDate : ""
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm sm:text-base">isOnSale</span>
              </label>
            </div>

            {/* Sale Date Fields - Show only when isOnSale is true */}
            {formData.isOnSale && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 p-4 bg-black/20 border border-[#FFD770]/20 rounded-md">
                <div>
                  <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">
                    Sale Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.saleStartDate}
                    onChange={(e) =>
                      setFormData({ ...formData, saleStartDate: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
                    required={formData.isOnSale}
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">
                    Sale End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.saleEndDate}
                    onChange={(e) =>
                      setFormData({ ...formData, saleEndDate: e.target.value })
                    }
                    className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
                    required={formData.isOnSale}
                    min={formData.saleStartDate} // Prevent end date from being before start date
                  />
                </div>
                <div className="sm:col-span-2 text-xs sm:text-sm text-[#FFD770]/60 mt-2">
                  <p>* Both dates are required when marking product as on sale</p>
                  <p>Sale end date must be after the start date</p>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-sm sm:text-base">Product Images</label>
              {imageInputs.map((key) => (
                <input
                  key={key}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleSingleImageChange(e, key)}
                  className="mb-2 w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm"
                />
              ))}
              <button
                type="button"
                onClick={handleAddMoreImages}
                className="mt-2 px-4 py-2 bg-[#FFD770] text-black rounded hover:scale-105 transition text-sm sm:text-base"
              >
                + Add More Pics
              </button>
            </div>

            {/* Modal Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className="px-4 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded hover:bg-[#FFD770]/10 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSubmit(showEditModal)}
                className="px-4 py-2 sm:py-3 w-full sm:w-[100px] flex justify-center items-center bg-[#FFD770] text-black rounded hover:scale-105 transition text-sm sm:text-base order-1 sm:order-2"
              >
                {loading ? (
                  <div className="loader1"></div>
                ) : showAddModal ? (
                  "Save"
                ) : (
                  "Update"
                )}
              </button>
            </div>
          </div>

          {/* Modal Animation */}
          <style jsx>{`
            @keyframes fade-in {
              from {
                opacity: 0;
                transform: scale(0.95);
              }
              to {
                opacity: 1;
                transform: scale(1);
              }
            }
            .animate-fade-in {
              animation: fade-in 0.3s ease-out;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default AddProduct;