import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import { env } from '@my-app/env/server'

// Mongoose connection logic for explicit schema usage
let isConnected = false

export const connectDB = async () => {
  if (isConnected) return
  try {
    const db = await mongoose.connect(env.DATABASE_URL)
    isConnected = db.connections[0]?.readyState === 1
    console.log('✅ MongoDB Connected')
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error)
  }
}

// Native MongoDB client for better-auth
const client = new MongoClient(env.DATABASE_URL)
await client.connect()
export const mongoDb = client.db()

// Export all Mongoose schemas
export * from './models/User'
export * from './models/Habit'
export * from './models/Mood'
