import Page from '../../components/Page'
import TopBar from '../../components/TopBar'

export default function Settings() {
  return (
    <>
      <TopBar searchPlaceholder="Search settings..." />
      <Page>
        <div className="mx-auto max-w-5xl">
          <h2 className="font-headline-md text-headline-md text-on-surface">Settings</h2>
          <p className="mt-1 text-body-md text-on-surface-variant">This is a placeholder screen to match the sidebar.</p>
        </div>
      </Page>
    </>
  )
}
