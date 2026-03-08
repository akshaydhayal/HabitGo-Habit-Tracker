import { User } from '@my-app/db'
import z from 'zod'
import { ObjectId } from 'mongodb'

import { protectedProcedure } from '../index'

const parseUserId = (id: any): string => {
  if (typeof id === 'string') return id
  if (id?.buffer) return Buffer.from(id.buffer).toString('hex')
  if (id?.toString) return id.toString()
  return String(id)
}

export const userRouter = {
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        dob: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      console.log('UPDATING PROFILE FOR USER:', userId)
      
      const updatedUser = await User.findOneAndUpdate(
        { _id: userId as any },
        { $set: { name: input.name, dob: input.dob, updatedAt: new Date() } },
        { new: true }
      )
      
      console.log('Query Result:', updatedUser)
      
      if (!updatedUser) {
        throw new Error('User not found in database')
      }
      return updatedUser.toJSON()
    }),
}
