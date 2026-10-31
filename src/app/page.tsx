import { getActiveRecommendations } from '@/app/actions/recommendations'
import { LandingClient } from '@/components/landing/LandingClient'

export const metadata = {
  title: 'موعظة ونور | حلقات تعليم القرآن أونلاين للنساء والأطفال',
  description: 'حلقات تحفيظ وتجويد أونلاين متخصصة للنساء والأطفال والرجال، بإشراف معلمين ومعلمات مؤهلين',
}

export default async function LandingPage() {
  const recommendations = await getActiveRecommendations()
  return <LandingClient recommendations={recommendations} />
}
