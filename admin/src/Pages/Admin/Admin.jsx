import React from 'react'
import Sidebar from "../../Components/Sidebar/Sidebar";
import {Routes, Route} from "react-router-dom";

const Admin = () => {
  return (
    <div>
      <Sidebar/>
      <Routes>
        <Route path="/addproduct" element={<AddProduct/>} />
        <Route path="/listproduct" element={<ListProduct/>} />
      </Routes>
      </div>
  )
}

export default Admin