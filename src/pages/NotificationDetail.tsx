import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { Bell, ArrowLeft, Paperclip } from 'lucide-react'

interface Notification {
  id: string
  title: string
  content: string
  date: {
    toDate: () => Date
  }
  category: string
  attachments?: string[]
}

const NotificationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [notification, setNotification] = useState<Notification | null>(null)

  useEffect(() => {
    const fetchNotification = async () => {
      if (id) {
        const docRef = doc(db, 'notifications', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setNotification({ id: docSnap.id, ...docSnap.data() } as Notification)
        }
      }
    }
    fetchNotification()
  }, [id])

  if (!notification) {
    return <div>Loading...</div>
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Link to="/notifications" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="mr-2" /> 返回通知列表
      </Link>
      <h2 className="text-3xl font-bold mb-4 flex items-center">
        <Bell className="mr-2" /> {notification.title}
      </h2>
      <div className="mb-4">
        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">{notification.category}</span>
        <span className="text-gray-500">{notification.date.toDate().toLocaleString()}</span>
      </div>
      <p className="text-gray-700 mb-4">{notification.content}</p>
      {notification.attachments && notification.attachments.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-2">附件</h3>
          <ul>
            {notification.attachments.map((attachment, index) => (
              <li key={index} className="flex items-center mb-2">
                <Paperclip className="mr-2" />
                <a href={attachment} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-600">
                  附件 {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default NotificationDetail