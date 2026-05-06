import { BrowserRouter } from 'react-router-dom'
import { AuthProvider }  from './context/AuthContext'
import AppRouter         from './routes/AppRouter'
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRouter />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  )
}