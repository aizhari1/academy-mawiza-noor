import Link from 'next/link'
import { getActiveRecommendations } from '@/app/actions/recommendations'
import { LandingClient } from '@/components/landing/LandingClient'
import { RecommendationsSection } from '@/components/landing/RecommendationsSection'

export const metadata = {
  title: 'موعظة ونور | حلقات تعليم القرآن أونلاين للنساء والأطفال',
  description: 'حلقات تحفيظ وتجويد أونلاين متخصصة للنساء والأطفال والرجال، بإشراف معلمين ومعلمات مؤهلين',
}

export default async function LandingPage() {
  const recommendations = await getActiveRecommendations()

  return (
    <>
      <LandingClient />
      <RecommendationsSection items={recommendations} />
      {/* Contact + Footer are inside LandingClient for interaction */}
    </>
  )
}
