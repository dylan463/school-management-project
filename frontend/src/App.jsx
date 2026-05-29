import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ModalProvider } from './context/ModalContext'
import AppRouter from './routes/AppRouter'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { NuqsAdapter } from 'nuqs/adapters/react-router'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

export default function App() {
  return (
    <>
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ModalProvider>
              <NuqsAdapter>
                <AuthProvider>
                    <AppRouter />
                </AuthProvider>
              </NuqsAdapter>
            </ModalProvider>
          </BrowserRouter>
      </QueryClientProvider>
    </>
  )
}
