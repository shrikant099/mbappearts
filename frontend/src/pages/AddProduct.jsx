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
    lowStockThreshold: "",
    category: "",
    subCategory: "",
    brand: "",
    // Dimensions
    length: "",
    width: "",
    height: "",
    dimensionUnit: "cm",
    weight: "",
    // Furniture specific
    roomType: [],
    style: [],
    material: [],
    color: [],
    finish: "",
    // Features
    features: [{ name: "", value: "" }],
    assemblyRequired: false,
    assemblyTime: "",
    weightCapacity: "",
    ecoFriendly: false,
    sustainableMaterials: false,
    certifications: [],
    // Shipping
    shippingWeight: "",
    shippingClass: "",
    freeShipping: false,
    flatShippingRate: "",
    deliveryTime: "",
    // Care and warranty
    careInstructions: "",
    warranty: "",
    // Status
    status: "active",
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
    isOnSale: false,
    saleStartDate: "",
    saleEndDate: "",
    // Release date
    releaseDate: "",
    // Custom fields
    countryOfOrigin: "",
    handcrafted: false,
  });

  const [imageInputs, setImageInputs] = useState([0]);
  const [images, setImages] = useState({});
  const [videoFile, setVideoFile] = useState(null);
  const [dimensionDiagramFile, setDimensionDiagramFile] = useState(null);

  // Available options for furniture
  const roomTypeOptions = [
    'Living Room', 'Bedroom', 'Dining Room', 'Kitchen', 'Bathroom', 'Office', 'Outdoor', 'Entryway', 'Kids Room', 'Other'
  ];
  
  const styleOptions = [
    'Modern', 'Contemporary', 'Minimalist', 'Mid-Century', 'Industrial', 'Traditional', 'Transitional', 'Rustic', 'Coastal', 'Scandinavian', 'Bohemian', 'Farmhouse', 'Art Deco', 'Asian', 'Other'
  ];
  
  const materialOptions = [
   'Wood', 'Metal', 'Glass', 'Plastic', 'Fabric', 'Leather', 'Marble', 'Stone', 'Rattan', 'Wicker', 'Bamboo', 'Other'
  ];
  
  const colorOptions = [
    "White", "Black", "Brown", "Natural", "Gray", "Beige", "Blue", 
    "Green", "Red", "Yellow", "Oak", "Walnut", "Mahogany", "Pine"
  ];

  const finishOptions = [
    "Matte", "Glossy", "Satin", "Natural", "Polished", "Brushed", "Distressed"
  ];

  const certificationOptions = [
    "FSC Certified", "GREENGUARD Gold", "CARB Phase 2", "ISO 14001", "Cradle to Cradle"
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

  const handleVideoChange = (e) => {
    setVideoFile(e.target.files[0]);
  };

  const handleDimensionDiagramChange = (e) => {
    setDimensionDiagramFile(e.target.files[0]);
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
        getAllProducts();
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

  // Handle multi-select arrays
  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value)
        : [...prev[field], value]
    }));
  };

  // Handle features
  const handleFeatureChange = (index, field, value) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures[index][field] = value;
    setFormData(prev => ({ ...prev, features: updatedFeatures }));
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { name: "", value: "" }]
    }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // Format date for input field
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
      const numericFields = ["price", "comparePrice", "costPerItem", "stock", "lowStockThreshold", 
                           "length", "width", "height", "weight", "assemblyTime", "weightCapacity", 
                           "shippingWeight", "flatShippingRate"];

      Object.entries(formData).forEach(([key, value]) => {
        if (numericFields.includes(key)) {
          if (value !== "") {
            const numVal = Number(value);
            if (isNaN(numVal)) throw new Error(`Invalid ${key} value`);
            payload.append(key, numVal);
          }
        } else if (Array.isArray(value)) {
          // Handle arrays
          if (key === 'features') {
            payload.append(key, JSON.stringify(value.filter(f => f.name && f.value)));
          } else {
            value.forEach((v) => payload.append(key, v));
          }
        } else if (key === 'saleStartDate' || key === 'saleEndDate' || key === 'releaseDate') {
          if (value) {
            payload.append(key, new Date(value).toISOString());
          }
        } else {
          payload.append(key, value);
        }
      });

      // Handle dimensions as nested object
      if (formData.length || formData.width || formData.height) {
        const dimensions = {
          length: formData.length ? Number(formData.length) : undefined,
          width: formData.width ? Number(formData.width) : undefined,
          height: formData.height ? Number(formData.height) : undefined,
          unit: formData.dimensionUnit
        };
        payload.append('dimensions', JSON.stringify(dimensions));
      }

      // Handle custom fields
      const customFields = {
        countryOfOrigin: formData.countryOfOrigin,
        handcrafted: formData.handcrafted
      };
      payload.append('customFields', JSON.stringify(customFields));

      // Handle images
      Object.values(images).forEach((file) => {
        payload.append("images", file);
      });

      // Handle video and dimension diagram
      if (videoFile) {
        payload.append("video", videoFile);
      }
      if (dimensionDiagramFile) {
        payload.append("dimensionDiagram", dimensionDiagramFile);
      }

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
      resetForm();
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
      lowStockThreshold: prod.lowStockThreshold || "",
      category: prod.category?._id || "",
      subCategory: prod.category?._id || "",
      brand: prod.brand?._id || "",
      length: prod.dimensions?.length || "",
      width: prod.dimensions?.width || "",
      height: prod.dimensions?.height || "",
      dimensionUnit: prod.dimensions?.unit || "cm",
      weight: prod.weight || "",
      roomType: Array.isArray(prod.roomType) ? prod.roomType : [],
      style: Array.isArray(prod.style) ? prod.style : [],
      material: Array.isArray(prod.material) ? prod.material : [],
      color: Array.isArray(prod.color) ? prod.color : [],
      finish: prod.finish || "",
      features: Array.isArray(prod.features) ? prod.features : [{ name: "", value: "" }],
      assemblyRequired: prod.assemblyRequired || false,
      assemblyTime: prod.assemblyTime || "",
      weightCapacity: prod.weightCapacity || "",
      ecoFriendly: prod.ecoFriendly || false,
      sustainableMaterials: prod.sustainableMaterials || false,
      certifications: Array.isArray(prod.certifications) ? prod.certifications : [],
      shippingWeight: prod.shippingWeight || "",
      shippingClass: prod.shippingClass || "",
      freeShipping: prod.freeShipping || false,
      flatShippingRate: prod.flatShippingRate || "",
      deliveryTime: prod.deliveryTime || "",
      careInstructions: prod.careInstructions || "",
      warranty: prod.warranty || "",
      status: prod.status || "active",
      isFeatured: prod.isFeatured || false,
      isNewArrival: prod.isNewArrival || false,
      isBestSeller: prod.isBestSeller || false,
      isOnSale: prod.isOnSale || false,
      saleStartDate: formatDateForInput(prod.saleStartDate) || "",
      saleEndDate: formatDateForInput(prod.saleEndDate) || "",
      releaseDate: formatDateForInput(prod.releaseDate) || "",
      countryOfOrigin: prod.customFields?.countryOfOrigin || "",
      handcrafted: prod.customFields?.handcrafted || false,
    });
    setImages({});
    setImageInputs([0]);
    setVideoFile(null);
    setDimensionDiagramFile(null);
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
      lowStockThreshold: "",
      category: "",
      subCategory: "",
      brand: "",
      length: "",
      width: "",
      height: "",
      dimensionUnit: "cm",
      weight: "",
      roomType: [],
      style: [],
      material: [],
      color: [],
      finish: "",
      features: [{ name: "", value: "" }],
      assemblyRequired: false,
      assemblyTime: "",
      weightCapacity: "",
      ecoFriendly: false,
      sustainableMaterials: false,
      certifications: [],
      shippingWeight: "",
      shippingClass: "",
      freeShipping: false,
      flatShippingRate: "",
      deliveryTime: "",
      careInstructions: "",
      warranty: "",
      status: "active",
      isFeatured: false,
      isNewArrival: false,
      isBestSeller: false,
      isOnSale: false,
      saleStartDate: "",
      saleEndDate: "",
      releaseDate: "",
      countryOfOrigin: "",
      handcrafted: false,
    });
    setImages({});
    setImageInputs([0]);
    setVideoFile(null);
    setDimensionDiagramFile(null);
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
          {/* Desktop Table View */}
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
                    <td colSpan="8" className="px-4 py-6 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
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

      {/* Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed z-[151] inset-0  backdrop-blur-md flex justify-center items-center p-2 sm:p-4">
          <div className="bg-black text-yellow-700 p-4 sm:p-6 rounded-xl max-w-6xl w-full hidescroll max-h-[95vh] overflow-y-auto shadow-[0_0_20px_rgba(255,215,112,0.3)] animate-fade-in border border-[#FFD770]/30 transition-all duration-300">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-center uppercase">
              {showAddModal ? "Add Product" : "Edit Product"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {/* Basic Information */}
              <div className="lg:col-span-3">
                <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Basic Information</h4>
              </div>
              
              {/* Text Inputs */}
              {[
                "name",
                "shortDescription",
                "price",
                "comparePrice",
                "costPerItem",
                "stock",
                "lowStockThreshold"
              ].map((key) => (
                <input
                  key={key}
                  type={
                    ["price", "stock", "comparePrice", "costPerItem", "lowStockThreshold"].includes(key)
                      ? "number"
                      : "text"
                  }
                  placeholder={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  value={formData[key]}
                  onChange={(e) =>
                    setFormData({ ...formData, [key]: e.target.value })
                  }
                  className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
                />
              ))}

              {/* Category and Brand */}
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
                <option className="bg-black" value="">Select Category</option>
                {categories.map((cat) => (
                  <option className="bg-black" key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={formData.brand}
                onChange={(e) =>
                  setFormData({ ...formData, brand: e.target.value })
                }
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm sm:text-base"
              >
                <option className="bg-black" value="">Select Brand</option>
                {brands.map((b) => (
                  <option className="bg-black" key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>

              {/* Dimensions */}
              <div className="lg:col-span-3">
                <h4 className="text-lg font-semibold mb-3 text-[#FFD770] mt-6">Dimensions & Weight</h4>
              </div>
              
              <input
                type="number"
                placeholder="Length"
                value={formData.length}
                onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />
              
              <input
                type="number"
                placeholder="Width"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />
              
              <input
                type="number"
                placeholder="Height"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />
              
              <select
                value={formData.dimensionUnit}
                onChange={(e) => setFormData({ ...formData, dimensionUnit: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm sm:text-base"
              >
                <option className="bg-black" value="cm">CM</option>
                <option className="bg-black" value="inches">Inches</option>
              </select>
              
              <input
                type="number"
                placeholder="Weight (kg)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />

              {/* Furniture Specifications */}
              <div className="lg:col-span-3">
                <h4 className="text-lg font-semibold mb-3 text-[#FFD770] mt-6">Furniture Specifications</h4>
              </div>

              {/* Room Type Selection */}
              <div className="lg:col-span-3">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Room Type</label>
                <div className="flex flex-wrap gap-2">
                  {roomTypeOptions.map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => handleArrayChange('roomType', room)}
                      className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                        formData.roomType.includes(room)
                          ? 'bg-[#FFD770] text-black border-[#FFD770]'
                          : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                  Selected: {formData.roomType.length > 0 ? formData.roomType.join(', ') : 'None'}
                </div>
              </div>

              {/* Style Selection */}
              <div className="lg:col-span-3">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Style</label>
                <div className="flex flex-wrap gap-2">
                  {styleOptions.map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => handleArrayChange('style', style)}
                      className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                        formData.style.includes(style)
                          ? 'bg-[#FFD770] text-black border-[#FFD770]'
                          : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                  Selected: {formData.style.length > 0 ? formData.style.join(', ') : 'None'}
                </div>
              </div>

              {/* Material Selection */}
              <div className="lg:col-span-3">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Materials</label>
                <div className="flex flex-wrap gap-2">
                  {materialOptions.map((material) => (
                    <button
                      key={material}
                      type="button"
                      onClick={() => handleArrayChange('material', material)}
                      className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                        formData.material.includes(material)
                          ? 'bg-[#FFD770] text-black border-[#FFD770]'
                          : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                      }`}
                    >
                      {material}
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                  Selected: {formData.material.length > 0 ? formData.material.join(', ') : 'None'}
                </div>
              </div>

              {/* Color Selection */}
              <div className="lg:col-span-3">
                <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Colors</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => handleArrayChange('color', color)}
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

              {/* Finish */}
              <select
                value={formData.finish}
                onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm sm:text-base"
              >
                <option className="bg-black" value="">Select Finish</option>
                {finishOptions.map((finish) => (
                  <option className="bg-black" key={finish} value={finish}>
                    {finish}
                  </option>
                ))}
              </select>

              {/* Assembly and Capacity */}
              <input
                type="number"
                placeholder="Assembly Time (minutes)"
                value={formData.assemblyTime}
                onChange={(e) => setFormData({ ...formData, assemblyTime: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />

              <input
                type="number"
                placeholder="Weight Capacity (kg)"
                value={formData.weightCapacity}
                onChange={(e) => setFormData({ ...formData, weightCapacity: e.target.value })}
                className="w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none focus:border-[#FFD770]/80 text-sm sm:text-base"
              />
            </div>

            {/* Description */}
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="mt-4 w-full px-3 py-2 sm:py-3 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none h-20 sm:h-24 text-sm sm:text-base"
            />

            {/* Features Section */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Product Features</h4>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Feature Name (e.g., Seats)"
                    value={feature.name}
                    onChange={(e) => handleFeatureChange(index, 'name', e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Value (e.g., 6 People)"
                    value={feature.value}
                    onChange={(e) => handleFeatureChange(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                  />
                  {formData.features.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addFeature}
                className="mt-2 px-4 py-2 bg-[#FFD770] text-black rounded hover:scale-105 transition text-sm"
              >
                + Add Feature
              </button>
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <label className="block font-semibold mb-2 text-[#FFD770] text-sm sm:text-base">Certifications</label>
              <div className="flex flex-wrap gap-2">
                {certificationOptions.map((cert) => (
                  <button
                    key={cert}
                    type="button"
                    onClick={() => handleArrayChange('certifications', cert)}
                    className={`px-2 sm:px-3 py-1 rounded border text-xs sm:text-sm transition ${
                      formData.certifications.includes(cert)
                        ? 'bg-[#FFD770] text-black border-[#FFD770]'
                        : 'bg-black/30 text-[#FFD770] border-[#FFD770]/40 hover:border-[#FFD770]/80'
                    }`}
                  >
                    {cert}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-xs sm:text-sm text-[#FFD770]/80">
                Selected: {formData.certifications.length > 0 ? formData.certifications.join(', ') : 'None'}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Shipping & Delivery</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <input
                  type="number"
                  placeholder="Shipping Weight (kg)"
                  value={formData.shippingWeight}
                  onChange={(e) => setFormData({ ...formData, shippingWeight: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Shipping Class"
                  value={formData.shippingClass}
                  onChange={(e) => setFormData({ ...formData, shippingClass: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
                
                <input
                  type="number"
                  placeholder="Flat Shipping Rate"
                  value={formData.flatShippingRate}
                  onChange={(e) => setFormData({ ...formData, flatShippingRate: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Delivery Time (e.g., 7-10 business days)"
                  value={formData.deliveryTime}
                  onChange={(e) => setFormData({ ...formData, deliveryTime: e.target.value })}
                  className="lg:col-span-3 w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Care and Warranty */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Care & Warranty</h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <textarea
                  placeholder="Care Instructions"
                  value={formData.careInstructions}
                  onChange={(e) => setFormData({ ...formData, careInstructions: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none h-20 text-sm"
                />
                
                <input
                  type="text"
                  placeholder="Warranty (e.g., 1 Year Manufacturer Warranty)"
                  value={formData.warranty}
                  onChange={(e) => setFormData({ ...formData, warranty: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Additional Information</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Country of Origin"
                  value={formData.countryOfOrigin}
                  onChange={(e) => setFormData({ ...formData, countryOfOrigin: e.target.value })}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md placeholder:text-[#FFD770]/60 focus:outline-none text-sm"
                />
              </div>
            </div>

            {/* Boolean Flags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mt-6">
              {[
                { key: "assemblyRequired", label: "Assembly Required" },
                { key: "ecoFriendly", label: "Eco Friendly" },
                { key: "sustainableMaterials", label: "Sustainable Materials" },
                { key: "handcrafted", label: "Handcrafted" },
                { key: "freeShipping", label: "Free Shipping" },
                { key: "isFeatured", label: "Featured" },
                { key: "isNewArrival", label: "New Arrival" },
                { key: "isBestSeller", label: "Best Seller" }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData[key]}
                    onChange={(e) =>
                      setFormData({ ...formData, [key]: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm sm:text-base">{label}</span>
                </label>
              ))}
              
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
                      saleStartDate: isChecked ? formData.saleStartDate : "",
                      saleEndDate: isChecked ? formData.saleEndDate : ""
                    });
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm sm:text-base">On Sale</span>
              </label>
            </div>

            {/* Date Fields */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Dates</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-2 text-[#FFD770] text-sm">Release Date</label>
                  <input
                    type="date"
                    value={formData.releaseDate}
                    onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    className="w-full px-3 py-2 bg-yellow-700 text-yellow-100 border border-[#FFD770]/40 rounded-md focus:outline-none text-sm"
                  />
                </div>
                
                {formData.isOnSale && (
                  <>
                    <div>
                      <label className="block font-semibold mb-2 text-[#FFD770] text-sm">Sale Start Date *</label>
                      <input
                        type="date"
                        value={formData.saleStartDate}
                        onChange={(e) => setFormData({ ...formData, saleStartDate: e.target.value })}
                        className="w-full px-3 py-2  bg-yellow-700 text-yellow-100 border border-[#FFD770]/40 rounded-md focus:outline-none text-sm"
                        required={formData.isOnSale}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold mb-2 text-[#FFD770] text-sm">Sale End Date *</label>
                      <input
                        type="date"
                        value={formData.saleEndDate}
                        onChange={(e) => setFormData({ ...formData, saleEndDate: e.target.value })}
                        className="w-full px-3 py-2  bg-yellow-700 text-yellow-100 border border-[#FFD770]/40 rounded-md focus:outline-none text-sm"
                        required={formData.isOnSale}
                        min={formData.saleStartDate}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Media Upload */}
            <div className="mt-6">
              <h4 className="text-lg font-semibold mb-3 text-[#FFD770]">Media</h4>
              
              {/* Product Images */}
              <div className="mb-4">
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
                  + Add More Images
                </button>
              </div>
              
              {/* Video Upload */}
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-sm sm:text-base">Product Video (Optional)</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm"
                />
              </div>
              
              {/* Dimension Diagram */}
              <div className="mb-4">
                <label className="block font-semibold mb-2 text-sm sm:text-base">Dimension Diagram (Optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleDimensionDiagramChange}
                  className="w-full px-3 py-2 bg-black/30 text-[#FFD770] border border-[#FFD770]/40 rounded-md text-sm"
                />
              </div>
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