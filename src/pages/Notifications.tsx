import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bell, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, startAfter, endBefore, getDocs, addDoc, Timestamp } from 'firebase/firestore'

interface Notification {
  id: string
  title: string
  content: string
  date: Timestamp
  category: string
}

const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [newNotification, setNewNotification] = useState({ title: '', content: '', category: '' })
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [firstVisible, setFirstVisible] = useState<any>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async (direction: 'next' | 'prev' = 'next') => {
    let q = query(collection(db, 'notifications'), orderBy('date', 'desc'), limit(pageSize))

    if (direction === 'next' && lastVisible) {
      q = query(q, startAfter(lastVisible))
    } else if (direction === 'prev' && firstVisible) {
      q = query(q, endBefore(firstVisible))
    }

    const querySnapshot = await getDocs(q)
    const notificationsData: Notification[] = []
    querySnapshot.forEach((doc) => {
      notificationsData.push({ id: doc.id, ...doc.data() } as Notification)
    })

    setNotifications(notificationsData)
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
    setFirstVisible(querySnapshot.docs[0])
    setPage(direction === 'next' ? page + 1 : page - 1)
  }

  const filteredNotifications = notifications.filter(
    notification =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (categoryFilter === '' || notification.category === categoryFilter)
  )

  const handleAddNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await addDoc(collection(db, 'notifications'), {
        ...newNotification,
        date: Timestamp.now()
      })
      setNewNotification({ title: '', content: '', category: '' })
      fetchNotifications()
    } catch (error) {
      console.error('Error adding notification:', error)
    }
  }

  const categories = Array.from(new Set(notifications.map(n => n.category)))

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 flex items-center"><Bell className="mr-2" /> 通知公告</h2>
      <div className="mb-4 flex">
        <div className="relative flex-grow mr-2">
          <input
            type="text"
            placeholder="搜索通知..."
            className="w-full p-2 pl-10 border rounded"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none w-full bg-white border rounded p-2 pr-8"
          >
            <option value="">所有分类</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <Filter className="absolute right-2 top-2.5 text-gray-400 pointer-events-none" />
        </div>
      </div>
      <form onSubmit={handleAddNotification} className="mb-4">
        <input
          type="text"
          placeholder="标题"
          value={newNotification.title}
          onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        <textarea
          placeholder="内容"
          value={newNotification.content}
          onChange={(e) => setNewNotification({ ...newNotification, content: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        <input
          type="text"
          placeholder="分类"
          value={newNotification.category}
          onChange={(e) => setNewNotification({ ...newNotification, category: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
          添加通知
        </button>
      </form>
      {filteredNotifications.map(notification => (
        <div key={notification.id} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <Link to={`/notifications/${notification.id}`} className="block">
            <h3 className="text-xl font-semibold mb-2">{notification.title}</h3>
            <p className="text-gray-600 mb-2">{notification.content.substring(0, 100)}...</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>{notification.date.toDate().toLocaleString()}</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">{notification.category}</span>
            </div>
          </Link>
        </div>
      ))}
      <div className="flex justify-between mt-4">
        <button
          onClick={() => fetchNotifications('prev')}
          disabled={page === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <ChevronLeft className="mr-2" /> 上一页
        </button>
        <button
          onClick={() => fetchNotifications('next')}
          disabled={notifications.length < pageSize}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          下一页 <ChevronRight className="ml-2" />
        </button>
      </div>
    </div>
  )
}

export default Notifications