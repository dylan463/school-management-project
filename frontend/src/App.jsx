<<<<<<< HEAD
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import AppRouter         from './routes/AppRouter'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  )
}
=======
import react from "react"
import { BrowserRouter,Routes,Route,Navigate } from "react-router-dom"
import Login from "./pages/Login"
import Home from "./pages/Home"
import NotFound from "./pages/NotFound"
import ProtectedRoute from "./components/ProtectedRoute"

function Logout(){
  localStorage.clear()
  return <Navigate to="/login" />
}

function App() {
  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Home />}/>
        <Route path="/logout" element={<Logout />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </>
  )
}

export default App

 
>>>>>>> 48f443108b5c8fe935880c201f85ac819895b3a2
