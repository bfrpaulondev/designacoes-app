import mongoose from 'mongoose'
import { connectDB } from './db'
import bcrypt from 'bcryptjs'

export async function authenticateUser(email: string, password: string) {
  await connectDB()
  
  const db = mongoose.connection.db
  const collection = db.collection('users')
  
  const user = await collection.findOne({ email })
  
  if (!user) {
    return null
  }
  
  const isValid = await bcrypt.compare(password, user.password)
  
  if (!isValid) {
    return null
  }
  
  return {
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role
  }
}

export async function createUser(email: string, password: string, name: string, role: string = 'designador') {
  await connectDB()
  
  const db = mongoose.connection.db
  const collection = db.collection('users')
  
  const hashedPassword = await bcrypt.hash(password, 10)
  
  const result = await collection.insertOne({
    email,
    password: hashedPassword,
    name,
    role,
    createdAt: new Date(),
    updatedAt: new Date()
  })
  
  return {
    id: result.insertedId.toString(),
    email,
    name,
    role
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}
