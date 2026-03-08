import { User } from '@my-app/db'
import z from 'zod'

import { protectedProcedure } from '../index'

export const userRouter = {
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        dob: z.string().min(1),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session.user.id
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { name: input.name, dob: input.dob },
        { new: true }
      )
      
      if (!updatedUser) {
        throw new Error('User not found in database')
      }
      return updatedUser.toJSON()
    }),
}
