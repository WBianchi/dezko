import { Card } from '@/components/ui/card'

export function LoadingCard() {
  return (
    <Card className="w-full max-w-md p-8 space-y-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="h-10 bg-gray-200 rounded animate-pulse" />
    </Card>
  )
}
