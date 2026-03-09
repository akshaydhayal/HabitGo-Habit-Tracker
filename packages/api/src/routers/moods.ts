import { Mood } from '@my-app/db'
import z from 'zod'
import mongoose from 'mongoose'
import { protectedProcedure } from '../index'

const parseUserId = (id: any): string => {
  if (typeof id === 'string') return id
  if (id?.buffer) return Buffer.from(id.buffer).toString('hex')
  if (id?.toString) return id.toString()
  return String(id)
}

export const moodsRouter = {
  getAll: protectedProcedure
    .input(z.object({ date: z.string().optional() }).optional())
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      const query: any = { 
        userId: new mongoose.Types.ObjectId(userId) as any 
      }
      if (input?.date) {
        query.date = input.date
      }
      const moods = await Mood.find(query).sort({ time: -1 })
      return moods.map((m) => m.toJSON())
    }),

  create: protectedProcedure
    .input(
      z.object({
        mood: z.enum(['Terrible', 'Bad', 'Okay', 'Good', 'Excellent']),
        activities: z.array(z.string()).default([]),
        context: z.string().optional(),
        date: z.string(), // YYYY-MM-DD
        time: z.string(), // HH:mm
      })
    )
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      const newMood = await Mood.create({
        ...input,
        userId: new mongoose.Types.ObjectId(userId) as any,
      })
      return newMood.toJSON()
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .handler(async ({ input, context }) => {
      const userId = parseUserId(context.session.user.id)
      await Mood.findOneAndDelete({ 
        _id: new mongoose.Types.ObjectId(input.id) as any, 
        userId: new mongoose.Types.ObjectId(userId) as any 
      })
      return { success: true }
    }),
}
