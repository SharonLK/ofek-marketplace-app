import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import PluginDetailPage from './pages/PluginDetailPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/plugin/:name" element={<PluginDetailPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
