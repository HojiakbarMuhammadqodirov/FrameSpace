import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import RoomDesigner from './pages/RoomDesigner'
import Profile from './pages/Profile'
import SharedDesign from './pages/SharedDesign'
import Gallery from './pages/Gallery'
import Compare from './pages/Compare'
import Shop from './pages/Shop'
import Collections from './pages/Collections'
import Inspiration from './pages/Inspiration'
import About from './pages/About'
import Contact from './pages/Contact'
import Legal from './pages/Legal'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/common/ProtectedRoute'
import { ToastProvider } from './hooks/useToastContext'

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/shared/:token" element={<SharedDesign />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/inspiration" element={<Inspiration />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/legal" element={<Legal />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/designer" element={<RoomDesigner />} />
            <Route path="/designer/:roomId" element={<RoomDesigner />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  )
}
