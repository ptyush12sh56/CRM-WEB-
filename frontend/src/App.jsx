import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import AppLayout from './components/AppLayout'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ContactsPage from './pages/ContactsPage'
import PipelinePage from './pages/PipelinePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/contacts" element={<ContactsPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/contacts" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
