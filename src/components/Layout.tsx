import { Link, Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      <header className="border-b border-neutral-800 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/OfekUnit.png/250px-OfekUnit.png"
            alt="Ofek Unit"
            className="h-8 w-auto"
          />
          <Link to="/" className="text-xl font-bold text-cyan-500 hover:text-cyan-400 no-underline">
            Ofek 324 AI Marketplace
          </Link>
          <span className="ml-auto text-sm text-neutral-500">OpenCode Plugins</span>
        </div>
      </header>
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <Outlet />
      </main>

    </div>
  )
}
