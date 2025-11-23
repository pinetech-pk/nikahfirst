import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatsCardProps {
  /** The title/label of the stat */
  title: string;
  /** The main value to display */
  value: string | number;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Icon background color classes (e.g., "bg-blue-100 text-blue-600") */
  iconColor?: string;
  /** Trend direction: "up", "down", or "neutral" */
  trend?: "up" | "down" | "neutral";
  /** Change text (e.g., "+12%" or "Needs attention") */
  change?: string;
  /** Additional description text */
  description?: string;
  /** Custom className for the card */
  className?: string;
  /** Enable hover shadow effect */
  hoverable?: boolean;
}

/**
 * Reusable stats card component for displaying metrics
 *
 * @example
 * // Simple stats card
 * <StatsCard
 *   title="Total Users"
 *   value="2,456"
 *   icon={Users}
 *   iconColor="bg-blue-100 text-blue-600"
 * />
 *
 * @example
 * // Stats card with trend
 * <StatsCard
 *   title="Monthly Revenue"
 *   value="$12,456"
 *   icon={DollarSign}
 *   iconColor="bg-green-100 text-green-600"
 *   trend="up"
 *   change="+18%"
 *   description="from last month"
 *   hoverable
 * />
 */
export function StatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "bg-gray-100 text-gray-600",
  trend,
  change,
  description,
  className,
  hoverable = false,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        hoverable && "hover:shadow-lg transition-shadow",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>

            {/* Trend and change indicator */}
            {(trend || change) && (
              <div className="flex items-center mt-2">
                {trend === "up" && (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                )}
                {trend === "down" && (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                {change && (
                  <span
                    className={cn(
                      "text-sm",
                      trend === "up" && "text-green-600",
                      trend === "down" && "text-red-600",
                      (!trend || trend === "neutral") && "text-gray-600"
                    )}
                  >
                    {change}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {description && (
              <p className="text-xs text-gray-500 mt-1">{description}</p>
            )}
          </div>

          {/* Icon */}
          <div className={cn("p-3 rounded-lg", iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Simple stats card variant (common on admin pages)
 * Simplified API for basic stats without trends
 */
export function SimpleStatsCard({
  title,
  value,
  icon: Icon,
  iconColor = "bg-gray-100 text-gray-600",
  className,
}: Pick<StatsCardProps, "title" | "value" | "icon" | "iconColor" | "className">) {
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg", iconColor)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
