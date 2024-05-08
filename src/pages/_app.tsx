import { UserProvider } from '@auth0/nextjs-auth0/client'
import { CacheProvider, EmotionCache } from '@emotion/react'
import CssBaseline from '@mui/material/CssBaseline'
import NoSsr from '@mui/material/NoSsr'
import { ThemeProvider } from '@mui/material/styles'
import { AppProps } from 'next/app'
import Head from 'next/head'
import Layout from 'src/components/Layout/Layout'
import { TITLE } from 'src/config/constants'
import createEmotionCache from 'src/config/createEmotionCache'
import theme from 'src/config/theme'
import { AppProvider } from 'src/contexts/app.context'
import QueryClientProvider from 'src/queries/provider'

// Client-side cache, shared for the whole session of the user in the browser.
const clientSideEmotionCache = createEmotionCache()

interface MyAppProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function MyApp(props: MyAppProps) {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props

  return (
    <UserProvider>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>{TITLE}</title>
        </Head>
        <ThemeProvider theme={theme}>
          {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
          <AppProvider>
            <NoSsr>
              <QueryClientProvider>
                <CssBaseline />
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </QueryClientProvider>
            </NoSsr>
          </AppProvider>
        </ThemeProvider>
      </CacheProvider>
    </UserProvider>
  )
}
