import BlogClient from './BlogClient'

export const metadata = {
  title: 'Digital Marketing Blog | Performance Marketing Insights',
  description: 'Expert insights on PPC, Meta Ads, SEO, CRO and performance marketing strategies by Prince Pandey.',
  alternates: { canonical: 'https://marketingbyprince.com/blog' },
}

export default function Page() {
  return <BlogClient />
}
