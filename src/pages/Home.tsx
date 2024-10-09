import React from 'react'
import { Link } from 'react-router-dom'
import { Bell, Vote } from 'lucide-react'

const Home: React.FC = () => {
  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-8">欢迎来到成都体育学院328寝室官网</h1>
      <p className="text-xl mb-8">这里是我们寝室的信息中心，你可以查看最新通知和参与投票。</p>
      <div className="flex justify-center space-x-4">
        <Link to="/notifications" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <Bell className="mr-2" /> 查看通知
        </Link>
        <Link to="/voting" className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded inline-flex items-center">
          <Vote className="mr-2" /> 参与投票
        </Link>
      </div>
    </div>
  )
}

export default Home