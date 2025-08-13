// chart-pie-label-custom.jsx

"use client"

import { TrendingUp } from "lucide-react"
import { Pie, PieChart } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A pie chart with labels"

export function ChartPieLabel({
  chartData = [],
  chartConfig = {},
  className = "",
  title = "Organization Status Distribution",
  description = "Current status overview",
  footerPrimaryText,
  footerSecondaryText,
}) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <CardHeader className="items-center pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pt-0 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-[200px] md:max-h-[220px]"
        >
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey="count"
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              nameKey="status"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm pt-2">
        <div className="flex items-center gap-2 leading-none font-medium">
          {footerPrimaryText ?? (
            <>
              Total organizations: {chartData.reduce((acc, item) => acc + (item.count || 0), 0)}{" "}
              <TrendingUp className="h-4 w-4" />
            </>
          )}
        </div>
        <div className="text-muted-foreground leading-none">
          {footerSecondaryText ?? "Showing status distribution of organizations"}
        </div>
      </CardFooter>
    </Card>
  )
}