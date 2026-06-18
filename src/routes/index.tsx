import { createFileRoute } from '@tanstack/react-router'
import HeroStoryteller from '../components/HeroStoryteller'
import StorySection from '../components/StorySection'
import Contact from '../components/Contact'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <>
      <HeroStoryteller />
      <StorySection />
      <Contact />
    </>
  )
}
