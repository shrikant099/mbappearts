import React from 'react'
import Sidebar from '../components/rest-comp/Sidebar'
import { Outlet } from 'react-router-dom'

const AdminLayout = () => {
  return (
    <div className='flex'>
        <Sidebar/>
        <main>
            <Outlet/>
        </main>
    </div>
  )
}

export default AdminLayout
