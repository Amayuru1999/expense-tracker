import { getAnalyticsData } from '@/lib/actions';
import AnalyticsClient from '@/components/AnalyticsClient';

export const revalidate = 0; // Dynamic server page

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();

  return <AnalyticsClient data={data} />;
}
