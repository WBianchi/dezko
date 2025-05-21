import { notFound } from "next/navigation"
import { getEspaco } from "./actions"
import { EspacoView } from "@/components/espaco/espaco-view"

export const dynamic = 'force-dynamic'

interface Props {
  params: {
    slug: string
  }
}

export default async function Page({ params }: Props) {
  const resolvedParams = await Promise.resolve(params)
  const espaco = await getEspaco(resolvedParams.slug)
  
  if (!espaco) {
    notFound()
  }

  return <EspacoView espaco={espaco} />
}
