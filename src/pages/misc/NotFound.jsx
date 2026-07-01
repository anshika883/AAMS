import { Link } from 'react-router-dom'
import Page from '../../components/Page'
import TopBar from '../../components/TopBar'

export default function NotFound() {
  return (
    <>
      <TopBar />
      <Page>
        <div className="mx-auto max-w-5xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Page not found</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">The page you requested does not exist.</p>
          <Link className="mt-lg inline-block font-bold text-primary hover:underline" to="/">
            Back to dashboard
          </Link>
        </div>
      </Page>
    </>
  )
}
