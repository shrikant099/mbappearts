import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { setRole, setToken, setUserData } from '../../slices/authSlice';
import toast from 'react-hot-toast';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: 'Admin Dashboard', path: '/admindashboard' },
    { name: 'Manage Product', path: '/admindashboard/addproduct' },
    { name: 'View Users', path: '/admindashboard/viewusers' },
    { name: 'Manage Categories', path: '/admindashboard/addcategory' },
    { name: 'Manage Brands', path: '/admindashboard/addbrands' },
    { name: 'Manage Orders', path: '/admindashboard/manageorders'},
    { name: 'Tech Support' , path: '/admindashboard/techsupport'}
  ];

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
      try {
       
        // Clear local storage
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userdata");
        localStorage.clear();
  
        // Clear Redux state
        dispatch(setToken(null));
        dispatch(setUserData(null));
        dispatch(setRole(null));
        dispatch(resetCart());
  
        toast.success("Logged out Successfully!");
        navigate("/");
      } catch (error) {
        console.error("Logout error:", error);
        toast.error("Unable to logout. Please try again.");
      }
    };

  return (
    <>
      {/* Hamburger for small screens */}
      <button
        className="lg:hidden fixed top-4 left-4 z-150 cursor-pointer text-[#FFD700] bg-black p-2 rounded focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        ☰
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 lg:static h-screen w-64 bg-black text-[#FFD700] transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out lg:translate-x-0 z-40 overflow-y-auto shadow-lg`}
      >
        {/* Close button on mobile */}
        <div className="lg:hidden z-150  flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} className="text-[#FFD700] cursor-pointer text-xl">×</button>
        </div>

        {/* Navigation */}
        <nav className="p-6 space-y-4">
          <h2 className="text-2xl font-semibold text-[#FFD700] mb-4">Dashboard</h2>
          {links.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block hover:text-white transition duration-300"
              onClick={() => setIsOpen(false)}
            >
              {link.name}
            </Link>
            
          ))}
          <div onClick={logoutHandler} className='block lg:hidden cursor-pointer hover:text-white transition duration-300'>
            LogOut
          </div>
        </nav>
      </div>
    </>
  );
}
