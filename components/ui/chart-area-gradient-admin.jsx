"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

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

export const description = "Organizations status trend (last 6 months)"

// Normalize status values to canonical keys
function normalizeStatus(status) {
  if (!status) return "unknown"
  const s = String(status).trim().toLowerCase()
  if (s.includes("ban")) return "banned"
  if (s === "verified" || s.includes("verify")) return "verified"
  if (
    s === "waiting for approvement" ||
    s === "waiting for approval" ||
    s.includes("wait") ||
    s.includes("pending") ||
    s.includes("approv")
  ) {
    return "waiting_for_approval"
  }
  return s
}

// Build an array of last N months labels like ["Mar 2025", "Apr 2025", ...]
function getLastNMonths(n) {
  const labels = []
  const now = new Date()
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const month = d.toLocaleString(undefined, { month: "short" })
    labels.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${month} ${d.getFullYear()}`,
      monthIndex: d.getMonth(),
      year: d.getFullYear(),
    })
  }
  return labels
}

// Aggregate organizations by created_at month and normalized status
function buildChartData(organizations = []) {
  const months = getLastNMonths(6)
  const buckets = months.reduce((acc, m) => {
    acc[m.key] = { month: m.label, waiting_for_approval: 0, verified: 0, banned: 0 }
    return acc
  }, {})

  for (const org of organizations) {
    if (!org?.created_at) continue
    const d = new Date(org.created_at)
    if (isNaN(d.getTime())) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    if (!(key in buckets)) continue // skip orgs outside last 6 months
    const norm = normalizeStatus(org.status)
    if (norm === "waiting_for_approval" || norm === "verified" || norm === "banned") {
      buckets[key][norm] += 1
    }
  }

  return months.map((m) => buckets[m.key])
}

const chartConfig = {
  waiting_for_approval: {
    label: "Waiting for Approval",
    color: "var(--chart-1)",
  },
  verified: {
    label: "Verified",
    color: "var(--chart-2)",
  },
  banned: {
    label: "Banned",
    color: "var(--chart-3)",
  },
}

export function ChartAreaGradient({
  className = "",
  title = "Organizations over time",
  description = "Status distribution over the last 6 months",
  footerPrimaryText = "",
  footerSecondaryText = "",
  organizations = [],
}) {
  const chartData = buildChartData(organizations)

  // Simple trend: compare last month total vs previous month
  let trendText = ""
  if (chartData.length >= 2) {
    const last = chartData[chartData.length - 1]
    const prev = chartData[chartData.length - 2]
    const sum = (r) => (r?.waiting_for_approval || 0) + (r?.verified || 0) + (r?.banned || 0)
    const lastTotal = sum(last)
    const prevTotal = sum(prev)
    const delta = lastTotal - prevTotal
    const pct = prevTotal > 0 ? Math.round((delta / prevTotal) * 1000) / 10 : 0
    const arrow = delta >= 0 ? "Trending up" : "Trending down"
    trendText = `${arrow} by ${Math.abs(pct)}% this month`
  }
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ChartContainer config={chartConfig} className="h-[220px] md:h-[240px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 0,
              bottom: 0,
              left: 35,
              right: 35,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <defs>
              <linearGradient id="fillWaiting" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-waiting_for_approval)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-waiting_for_approval)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillVerified" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-verified)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-verified)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillBanned" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-banned)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-banned)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <Area
              dataKey="waiting_for_approval"
              type="natural"
              fill="url(#fillWaiting)"
              fillOpacity={0.4}
              stroke="var(--color-waiting_for_approval)"
              stackId="a"
            />
            <Area
              dataKey="verified"
              type="natural"
              fill="url(#fillVerified)"
              fillOpacity={0.4}
              stroke="var(--color-verified)"
              stackId="a"
            />
            <Area
              dataKey="banned"
              type="natural"
              fill="url(#fillBanned)"
              fillOpacity={0.4}
              stroke="var(--color-banned)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              {(footerPrimaryText || trendText) || ""} { (footerPrimaryText || trendText) && <TrendingUp className="h-4 w-4" /> }
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              {footerSecondaryText || "Last 6 months"}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
