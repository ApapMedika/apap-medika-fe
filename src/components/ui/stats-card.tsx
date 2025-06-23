import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
    trend?: {
      value: number;
      isPositive: boolean;
    };
}
  
export function StatsCard({ title, value, icon: Icon, color = "text-blue-600", trend }: StatsCardProps) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {trend && (
                <p className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}% from last period
                </p>
              )}
            </div>
            <Icon className={`h-8 w-8 ${color}`} />
          </div>
        </CardContent>
      </Card>
    );
}