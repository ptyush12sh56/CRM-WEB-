import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('crm_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)

  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.me(token)
      .then(setUser)
      .catch(() => { setToken(null); localStorage.removeItem('crm_token') })
      .finally(() => setLoading(false))
  }, [token])

  const login = useCallback(async (email, password) => {
    const { access_token } = await api.login(email, password)
    localStorage.setItem('crm_token', access_token)
    setToken(access_token)
    const me = await api.me(access_token)
    setUser(me)
  }, [])

  const signup = useCallback(async (name, email, password) => {
    await api.signup(name, email, password)
    await login(email, password)
  }, [login])

  const logout = useCallback(() => {
    localStorage.removeItem('crm_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ token, user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
