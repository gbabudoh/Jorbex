import { getSiteContent } from '@/lib/siteContent';
import HomepageClient from './HomepageClient';

export default async function Home() {
  const heroContent = await getSiteContent('hero');

  return (
    <HomepageClient
      candidateImageUrl={heroContent.candidate_image_url}
      employerImageUrl={heroContent.employer_image_url}
    />
  );
}
