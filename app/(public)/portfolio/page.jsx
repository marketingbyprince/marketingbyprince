import PortfolioClient from './PortfolioClient'

export const metadata = {
  title: 'Portfolio | Case Studies & Results | Marketing By Prince',
  description: 'Real client results: 3-10x ROAS, 5x lead growth, 60-70 quality leads/month. View my performance marketing portfolio.',
  alternates: { canonical: 'https://marketingbyprince.com/portfolio' },
}

export default function Page() {
  return <PortfolioClient />
}
