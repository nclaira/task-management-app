// src/app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';

type Priority = 'Low' | 'Medium' | 'High';

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  priority: Priority;
  userEmail: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function Dashboard() {
  // ... [rest of your existing dashboard code]
}