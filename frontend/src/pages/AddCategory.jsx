import React, { useEffect, useState } from "react";
import { categoryEndpoints } from "../services/api";
import { useDispatch, useSelector } from "react-redux";
import { setLoading } from "../slices/authSlice";
import { apiConnector } from "../services/apiConnector";
import toast from "react-hot-toast";

const { createCategory, getAllCategory, updateCategory, activeInactiveCategory } =
  categoryEndpoints;

const AddCategory = () => {
  const loading = useSelector((state) => state.auth.loading);
  const dispatch = useDispatch();

  const token = useSelector(state => state.auth.token)

  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState({
    id: "",
    name: "",
    description: "",
  });
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const getAllCategories = async () => {
    try {
      dispatch(setLoading(true));
      const res = await apiConnector("GET", getAllCategory,null,{
        Authorization : `Bearer ${token}`
      });
      console.log(res)
      setCategories(res.data);
      toast.success("All Categories fetched successfully!");
    } catch (err) {
      console.log(err);
      toast.error("Unable to fetch categories");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    getAllCategories();
  }, []);

  const handleAdd = async () => {
    try {
      const res = await apiConnector("POST", createCategory, newCategory,{
        Authorization : `Bearer ${token}`
      });
      console.log(res);
      toast.success("Category created successfully!");
      setShowAddModal(false);
      getAllCategories();
      setNewCategory({ name: "", description: "" });
    } catch (err) {
      console.log(err);
      toast.error("Failed to create category");
    }
  };

  const handleEdit = async () => {
    try {
      const res = await apiConnector(
        "PUT",
        `${updateCategory}/${editData.id}`,
        {
          name: editData.name,
          description: editData.description,
        },{
        Authorization : `Bearer ${token}`
      }
      );
      console.log(res);
      toast.success("Category updated successfully!");
      setShowEditModal(false);
      getAllCategories();
      setEditData({
        id: "",
        name: "",
        description: "",
      });
    } catch (err) {
      console.log(err);
      toast.error("Failed to update category");
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      dispatch(setLoading(true));
      const updatedStatus = currentStatus === "active" ? "inactive" : "active";
      const res = await apiConnector("PATCH", `${activeInactiveCategory}${id}`, {
        data: updatedStatus,
      },{
        Authorization : `Bearer ${token}`
      });
      console.log("the response of making it inactive is : ", res);
      toast.success(`Category marked as ${updatedStatus}`);
      getAllCategories();
    } catch (err) {
      console.log(err);
      toast.error("Failed to update status");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="add-category lg:w-[calc(100vw-256px)] h-[100vh] overflow-y-auto p-6 ">
      <h2 className="text-2xl font-semibold mb-4 text-black">
        Manage Categories
      </h2>

      {/* Add Category Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="bg-[#FFD770] text-black px-6 py-2 rounded shadow-lg mb-4 hover:brightness-110 transition"
      >
        + Add Category
      </button>

      {/* Category Table */}
      {loading ? (
        <div className="w-full h-[50vh] flex justify-center items-center">
          <div className="spinner"></div>
        </div>
      ) : (
        <table className="w-full text-black bg-white rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-[#FFD770]">
            <tr>
              <th className="py-2 px-4 text-left">Sr. No.</th>
              <th className="py-2 px-4 text-left">Name</th>
              <th className="py-2 px-4 text-left hidden lg:table-cell">
                Description
              </th>
              <th className="py-2 px-4 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {categories?.map((cat, index) => (
              <tr key={cat._id} className="border-t border-gray-200">
                <td className="py-2 px-4">{index + 1}</td>
                <td className="py-2 px-4">{cat.name}</td>
                <td className="py-2 px-4 hidden lg:table-cell">
                  {cat.description.substr(0, 30)}...
                </td>
                <td className="py-2 px-4 flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setEditData({
                        id: cat._id,
                        name: cat.name,
                        description: cat.description,
                      });
                      setShowEditModal(true);
                    }}
                    className="bg-[#FFD770] text-black px-3 py-1 rounded hover:brightness-110 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleStatus(cat._id, cat.status)}
                    className={`px-3 py-1 rounded transition ${
                      cat.status === "active"
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {cat.status === "active" ? "Turn Inactive" : "Turn Active"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-md text-black">
            <h3 className="text-xl font-semibold mb-4">Add Category</h3>
            <input
              type="text"
              placeholder="Name"
              value={newCategory.name}
              onChange={(e) =>
                setNewCategory({ ...newCategory, name: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) =>
                setNewCategory({ ...newCategory, description: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-[#FFD770] text-black rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 backdrop-blur-2xl bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-[90%] max-w-md text-black">
            <h3 className="text-xl font-semibold mb-4">Edit Category</h3>
            <input
              type="text"
              placeholder="Name"
              value={editData.name}
              onChange={(e) =>
                setEditData({ ...editData, name: e.target.value })
              }
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              placeholder="Description"
              value={editData.description}
              onChange={(e) =>
                setEditData({ ...editData, description: e.target.value })
              }
              className="w-full mb-4 p-2 border rounded"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-[#FFD770] text-black rounded"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategory;
