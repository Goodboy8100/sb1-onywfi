import React from 'react'
import { Link } from 'react-router-dom'
import { Home, Bell, Vote } from 'lucide-react'

const Header: React.FC = () => {
  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold flex items-center">
          <Home className="mr-2" /> 328寝室
        </Link>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link to="/notifications" className="flex items-center hover:text-blue-200">
                <Bell className="mr-1" /> 通知
              </Link>
            </li>
            <li>
              <Link to="/voting" className="flex items-center hover:text-blue-200">
                <Vote className="mr-1" /> 投票
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header