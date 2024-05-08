import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { useMemo } from 'react'

export default function Provider({ children }: { children: React.ReactNode }) {
  const [queryClient, persisterOptions] = useMemo(() => {
    const qc = new QueryClient({
      defaultOptions: {
        queries: {
          // With SSR, we usually want to set some default staleTime
          // above 0 to avoid refetching immediately on the client
          staleTime: 5 * 60 * 1000, // 10 minutes
          gcTime: 60 * 60 * 1000, // 1 hour, cached
        },
      },
    })
    const persister = createSyncStoragePersister({
      storage: window.localStorage,
    })
    return [qc, { persister }]
  }, [])

  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={persisterOptions}>
      {children}
    </PersistQueryClientProvider>
  )
}
