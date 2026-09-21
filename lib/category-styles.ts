import type { Category } from './data'

// Tailwind classes for each category badge. Kept within the theme accent range.
export const categoryStyles: Record<Category, string> = {
  Tech: 'bg-primary/15 text-primary border-primary/30',
  Art: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  Sports: 'bg-accent/15 text-accent border-accent/30',
  Charity: 'bg-chart-3/15 text-chart-3 border-chart-3/30',
  Music: 'bg-chart-5/15 text-chart-5 border-chart-5/30',
  Business: 'bg-chart-4/15 text-chart-4 border-chart-4/30',
  Debate: 'bg-accent/15 text-accent border-accent/30',
}
