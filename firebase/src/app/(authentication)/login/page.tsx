'use client'
import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useRouter } from 'next/navigation' // App Router


export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()


  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password) 
      alert('Logged in successfully!')
      router.push('/') // redirect after login
    } catch (error) {
      alert(error)
    }
  }


  return (

    <div className="flex flex-row gap-8 items-center justify-center min-h-screen bg-slate-900 p-8">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-yellow-600 mb-2">Welcome back to our platforrm</h1>
        <p className="text-gray-600 text-2xl">Log in to your account to get started</p>
      </div>
    
      <div className="bg-white p-32 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form onSubmit={handleLogin} className="space-y-7 w-100">
          <input type="email" placeholder="Email" className="w-full border p-5 rounded" value={email} 
          onChange={(e) => setEmail(e.target.value)} 
          />
          <input type="password" placeholder="Password" className="w-full border p-5 rounded" value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          />
          <button className="w-full bg-slate-500 text-xl text-white p-5 rounded hover:bg-slate-600 transition-colors" 
          type="submit"
          >
          Login
          </button>
        </form>

        <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 transition-colors" 
        onClick={() => router.push('/register')}
        >
        Don't have an account? Register
        </button>
      </div>
    </div>  
  
  )
}
