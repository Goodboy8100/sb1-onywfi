import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Vote, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { db } from '../firebase'
import { collection, query, orderBy, limit, startAfter, endBefore, getDocs, addDoc, Timestamp } from 'firebase/firestore'

interface PollOption {
  id: string
  text: string
  votes: number
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  isMultipleChoice: boolean
  createdAt: Timestamp
}

const Voting: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([])
  const [newPoll, setNewPoll] = useState<Omit<Poll, 'id' | 'createdAt'>>({
    question: '',
    options: [{ id: '1', text: '', votes: 0 }],
    isMultipleChoice: false,
  })
  const [lastVisible, setLastVisible] = useState<any>(null)
  const [firstVisible, setFirstVisible] = useState<any>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5

  useEffect(() => {
    fetchPolls()
  }, [])

  const fetchPolls = async (direction: 'next' | 'prev' = 'next') => {
    let q = query(collection(db, 'polls'), orderBy('createdAt', 'desc'), limit(pageSize))

    if (direction === 'next' && lastVisible) {
      q = query(q, startAfter(lastVisible))
    } else if (direction === 'prev' && firstVisible) {
      q = query(q, endBefore(firstVisible))
    }

    const querySnapshot = await getDocs(q)
    const pollsData: Poll[] = []
    querySnapshot.forEach((doc) => {
      pollsData.push({ id: doc.id, ...doc.data() } as Poll)
    })

    setPolls(pollsData)
    setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1])
    setFirstVisible(querySnapshot.docs[0])
    setPage(direction === 'next' ? page + 1 : page - 1)
  }

  const handleAddOption = () => {
    setNewPoll({
      ...newPoll,
      options: [...newPoll.options, { id: (newPoll.options.length + 1).toString(), text: '', votes: 0 }]
    })
  }

  const handleCreatePoll = async () => {
    if (newPoll.question && newPoll.options.every(option => option.text)) {
      try {
        await addDoc(collection(db, 'polls'), {
          ...newPoll,
          createdAt: Timestamp.now()
        })
        setNewPoll({
          question: '',
          options: [{ id: '1', text: '', votes: 0 }],
          isMultipleChoice: false,
        })
        fetchPolls()
      } catch (error) {
        console.error('Error creating poll:', error)
      }
    }
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4 flex items-center"><Vote className="mr-2" /> 在线投票</h2>
      
      {polls.map(poll => (
        <Link key={poll.id} to={`/voting/${poll.id}`} className="block">
          <div className="bg-white p-4 rounded-lg shadow-md mb-4 hover:bg-gray-50 transition duration-150">
            <h3 className="text-xl font-semibold mb-2">{poll.question}</h3>
            <p className="text-gray-600 mb-2">选项数: {poll.options.length}</p>
            <div className="text-sm text-gray-500">
              创建于: {poll.createdAt.toDate().toLocaleString()}
            </div>
          </div>
        </Link>
      ))}

      <div className="flex justify-between mt-4 mb-8">
        <button
          onClick={() => fetchPolls('prev')}
          disabled={page === 1}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          <ChevronLeft className="mr-2" /> 上一页
        </button>
        <button
          onClick={() => fetchPolls('next')}
          disabled={polls.length < pageSize}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center"
        >
          下一页 <ChevronRight className="ml-2" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-2">创建新投票</h3>
        <input
          type="text"
          placeholder="输入问题"
          value={newPoll.question}
          onChange={(e) => setNewPoll({ ...newPoll, question: e.target.value })}
          className="w-full p-2 mb-2 border rounded"
        />
        {newPoll.options.map((option, index) => (
          <input
            key={option.id}
            type="text"
            placeholder={`选项 ${index + 1}`}
            value={option.text}
            onChange={(e) => setNewPoll({
              ...newPoll,
              options: newPoll.options.map(o => o.id === option.id ? { ...o, text: e.target.value } : o)
            })}
            className="w-full p-2 mb-2 border rounded"
          />
        ))}
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="isMultipleChoice"
            checked={newPoll.isMultipleChoice}
            onChange={(e) => setNewPoll({ ...newPoll, isMultipleChoice: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="isMultipleChoice">允许多选</label>
        </div>
        <button
          onClick={handleAddOption}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded mr-2 flex items-center"
        >
          <PlusCircle className="mr-1" /> 添加选项
        </button>
        <button
          onClick={handleCreatePoll}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center mt-2"
        >
          <Vote className="mr-1" /> 创建投票
        </button>
      </div>
    </div>
  )
}

export default Voting