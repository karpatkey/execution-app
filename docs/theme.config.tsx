import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'
import { useRouter } from 'next/router'
import Image from 'next/image'

const config: DocsThemeConfig = {
  project: {
    link: 'https://github.com/karpatkey/panic-button-app'
  },
  docsRepositoryBase: 'https://github.com/karpatkey/panic-button-app/tree/main/docs',
  logo: <span className="text-mono">Panic Button App</span>,
  useNextSeoProps() {
    const { asPath } = useRouter()
    if (asPath !== '/') {
      return {
        titleTemplate: '%s – Panic Button App'
      }
    }
  },
  primaryHue: 32,
  primarySaturation: 0,
  darkMode: true,
  nextThemes: {
    defaultTheme: 'system'
  },
  head: function useHead() {
    const { title } = useConfig()

    return (
      <>
        <meta name="msapplication-TileColor" content="#eeeded" />
        <meta name="theme-color" content="#eeeded" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content="TODO: Docs" />
        <meta name="og:description" content="TODO: Docs" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="/avatar.png" />
        <meta name="og:title" content={title} />
        <meta name="og:image" content="/avatar.png" />
        <meta name="apple-mobile-web-app-title" content="Panic Button App" />
        <link href="/favicon.png" rel="icon" type="image/png"></link>
        <link href="/avatar.png" rel="apple-touch-icon"></link>
      </>
    )
  },
  editLink: {
    text: 'Edit this page on GitHub →'
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'feedback'
  },
  sidebar: {
    titleComponent({ title, type }) {
      if (type === 'separator') {
        return <span className="cursor-default">{title}</span>
      }
      return <>{title}</>
    },
    defaultMenuCollapseLevel: 1,
    toggleButton: true
  },
  footer: {
    text: (
      <div className="flex w-full flex-col items-center sm:items-start">
        <div>
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://www.karpatkey.com"
            target="_blank"
          >
            By{' '}
            <Image
              src="/docs/karpatkey.png"
              alt="Karpatkey Logo"
              className="dark:invert"
              width={100}
              height={20}
              priority
            />
          </a>
        </div>
      </div>
    )
  }
}

export default config
