import { BrowserRouter, Routes, Route } from "react-router-dom";
import Footer from "./Components/Footer/Footer";
import Navbar from "./Components/Navbar/Navbar";
import Admin from "./Pages/Admin";

function App() {
  return (
    <BrowserRouter>
      <div>
        <Navbar />
        <Routes>
          {/* Admin Panel Routes - No Authentication Required */}
          <Route path="/*" element={<Admin />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
