import type { AppRouterClient } from '@my-app/api/routers/index'
import { env } from '@my-app/env/native'
import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createTanstackQueryUtils } from '@orpc/tanstack-query'
import { QueryCache, QueryClient } from '@tanstack/react-query'
import { Platform } from 'react-native'

import { authClient } from '@/lib/auth-client'

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      console.log(error)
    },
  }),
})

export const link = new RPCLink({
  url: `${env.EXPO_PUBLIC_SERVER_URL}/rpc`,
  fetch:
    Platform.OS !== 'web'
      ? undefined
      : (url, options) =>
          fetch(url, {
            ...options,
            credentials: 'include',
          }),
  headers: async () => {
    if (Platform.OS === 'web') return {}

    const headers = new Map<string, string>()
    
    // Grab the exact scheme defined in better-auth expoClient config
    const prefix = 'my-app' 
    const cookieName = `${prefix}_cookie`
    
    try {
      // SecureStore requires asynchronous reads
      const { getItemAsync } = require('expo-secure-store')
      const cookieData = await getItemAsync(cookieName)
      
      if (cookieData) {
        const parsed = JSON.parse(cookieData)
        const cookieString = Object.entries(parsed).reduce((acc, [key, value]: any) => {
          if (value.expires && new Date(value.expires) < new Date()) return acc;
          return acc ? `${acc}; ${key}=${value.value}` : `${key}=${value.value}`;
        }, "");
        
        if (cookieString) {
          headers.set('Cookie', cookieString)
        }
      }
    } catch (e) {
      console.warn('Failed to parse secure store cookie', e)
    }

    headers.set('expo-origin', 'exp://my-app')
    headers.set('x-skip-oauth-proxy', 'true')

    return Object.fromEntries(headers)
  },
})

export const client: AppRouterClient = createORPCClient(link)

export const orpc = createTanstackQueryUtils(client)
