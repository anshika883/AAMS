import { Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Reports from './pages/Reports'
import BuildingInventory from './pages/residential/BuildingInventory'
import GuestHouses from './pages/guestHouses/GuestHouses'
import Settings from './pages/misc/Settings'
import NotFound from './pages/misc/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />

        <Route path="residential" element={<Navigate to="/residential/nt1" replace />} />
        <Route path="residential/:buildingCode" element={<BuildingInventory />} />

        <Route path="reports" element={<Reports />} />

        <Route path="guest-houses" element={<Navigate to="/guest-houses/nt1" replace />} />
        <Route path="guest-houses/:houseCode" element={<GuestHouses />} />

        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
