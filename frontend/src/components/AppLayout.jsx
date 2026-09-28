import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const { logout } = useAuth()
  return (
    <div className="app-shell">
      <aside>
        <div className="wordmark">Ledger</div>
        <nav>
          <NavLink to="/contacts" className={({ isActive }) => (isActive ? 'active' : '')}>
            Contacts
          </NavLink>
          <NavLink to="/pipeline" className={({ isActive }) => (isActive ? 'active' : '')}>
            Pipeline
          </NavLink>
        </nav>
        <button className="signout" onClick={logout}>Sign out</button>
      </aside>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
