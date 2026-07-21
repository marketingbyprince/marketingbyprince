import ExpertiseClient from './ExpertiseClient'

export const metadata = {
  title: 'Marketing Expertise | Prince Pandey',
  description: 'A full breakdown of the marketing discipline I\'ve mastered — from fundamentals and measurement to platform execution, creative, lifecycle marketing, and advanced analytics.',
  alternates: { canonical: 'https://marketingbyprince.com/expertise' },
}

export default function Page() {
  return <ExpertiseClient />
}
