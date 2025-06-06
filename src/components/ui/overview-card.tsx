"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface OverviewCardProps {
  title: string
  value: string | number
  icon: JSX.Element
  description?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function OverviewCard({
  title,
  value,
  icon,
  description,
  trend,
  className
}: OverviewCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {(description || trend) && (
          <div className="flex items-center gap-2">
            {trend && (
              <p className={cn(
                "text-xs",
                trend.isPositive ? "text-green-600" : "text-red-600"
              )}>
                {trend.isPositive ? "+" : "-"}{trend.value}%
              </p>
            )}
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
