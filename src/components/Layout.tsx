import Sidebar from './Sidebar'

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen w-full lg:ml-0">
        <div className="pt-16 lg:pt-0">
          {children}
        </div>
      </main>
    </div>
  )
}
