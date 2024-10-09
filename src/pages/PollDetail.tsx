import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore'
import { db } from '../firebase'
import { Vote, ArrowLeft, BarChart } from 'lucide-react'

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
  createdAt: {
    toDate: () => Date
  }
}

const PollDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [poll, setPoll] = useState<Poll | null>(null)

  useEffect(() => {
    const fetchPoll = async () => {
      if (id) {
        const docRef = doc(db, 'polls', id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setPoll({ id: docSnap.id, ...docSnap.data() } as Poll)
        }
      }
    }
    fetchPoll()
  }, [id])

  const handleVote = async (optionId: string) => {
    if (poll && id) {
      const pollRef = doc(db, 'polls', id)
      await updateDoc(pollRef, {
        [`options.${optionId}.votes`]: arrayUnion(1)
      })
      // Update local state
      setPoll(prevPoll => {
        if (!prevPoll) return null
        return {
          ...prevPoll,
          options: prevPoll.options.map(option =>
            option.id === optionId ? { ...option, votes: option.votes + 1 } : option
          )
        }
      })
    }
  }

  if (!poll) {
    return <div>Loading...</div>
  }

  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0)

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <Link to="/voting" className="flex items-center text-blue-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="mr-2" /> 返回投票列表
      </Link>
      <h2 className="text-3xl font-bold mb-4 flex items-center">
        <Vote className="mr-2" /> {poll.question}
      </h2>
      <div className="mb-4 text-gray-500">
        创建于: {poll.createdAt.toDate().toLocaleString()}
      </div>
      <div className="mb-6">
        {poll.options.map(option => (
          <div key={option.id} className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span>{option.text}</span>
              <button
                onClick={() => handleVote(option.id)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
              >
                投票
              </button>
            </div>
            <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                    {option.votes} 票
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-blue-600">
                    {totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
                <div
                  style={{ width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <BarChart className="mr-2" /> 投票结果可视化
        </h3>
        {/* 这里可以添加更复杂的图表库，如 Chart.js 或 Recharts */}
        <div className="bg-gray-100 p-4 rounded">
          {poll.options.map(option => (
            <div key={option.id} className="mb-2">
              <div className="flex justify-between mb-1">
                <span>{option.text}</span>
                <span>{option.votes} 票 ({totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0}%)</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PollDetail