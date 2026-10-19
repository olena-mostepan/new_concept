import { notFound } from "next/navigation"
import { getTenderConfig, tenderList } from "@/lib/tender-data"
import { TenderComparisonPage } from "@/components/tender-comparison-page"

interface TenderPageProps {
  params: Promise<{
    slug: string
  }>
}

export function generateStaticParams() {
  return tenderList.map((tender) => ({ slug: tender.slug }))
}

export default async function TenderPage({ params }: TenderPageProps) {
  const { slug } = await params
  const config = getTenderConfig(slug)

  if (!config) {
    return notFound()
  }

  return <TenderComparisonPage config={config} />
}

