import { createContext, useContext, useState, useEffect } from 'react'
import { loginApi, registerApi, getProfileApi, logoutApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On mount — restore user from token
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      getProfileApi()
        .then(({ data }) => setUser(data))
        .catch(() => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const { data } = await loginApi(credentials)
    localStorage.setItem('access_token', data.access)
    localStorage.setItem('refresh_token', data.refresh)
    const profile = await getProfileApi()
    setUser(profile.data)
    return profile.data
  }

  const register = async (formData) => {
    await registerApi(formData)
    // Auto-login after register
    return login({ email: formData.email, password: formData.password })
  }

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await logoutApi(refresh)
    } catch {}
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  const updateUser = (data) => setUser((u) => ({ ...u, ...data }))

  const isLoggedIn = !!user

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
