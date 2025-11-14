'use client'
import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation'


export default function RegisterPage() {
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const router = useRouter()


  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUserWithEmailAndPassword(auth, email, password)  // built-in method ifita 3 par
      alert('Account created successfully!')
      router.push('/login') // redirect to login after signup
    } catch (error) {
      alert(error)
    }
  }


  return (

    <div className ="flex flex-row gap-8 items-center justify-center min-h-screen bg-slate-900 p-8">

      <div className="text-center">
        <h1 className="text-5xl font-bold text-yellow-600 mb-2">Welcome to our platforrm</h1>
        <p className="text-gray-600 text-2xl">Create your account to get started</p>
      </div>

      <div className="bg-white p-32 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form onSubmit={handleRegister} className="space-y-7 w-100">
          <input type="email" placeholder="Email" className="w-full border p-5" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full border p-5" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button className="w-full bg-slate-500 text-xl text-white p-5 rounded hover:bg-slate-600 transition-colors" type="submit">Sign Up</button>
        </form>
        <button
          className="mt-4 text-sm text-blue-600"
          onClick={() => router.push('/login')} 
        >
        Already have an account? Login
        </button>
      </div>
    </div>
    
    
  )
}
