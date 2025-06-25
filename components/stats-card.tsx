interface StatsCardProps {
  title: string
  value: number
  description: string
}

export function StatsCard({ title, value, description }: StatsCardProps) {
  return (
    <div className="card">
      <h3 className="text-sm font-medium text-neutral-600">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
      <p className="text-sm text-neutral-500 mt-1">{description}</p>
    </div>
  )
}
