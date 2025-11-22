import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateSlug(name: string, location?: string) {
  const base = location ? `${name}-${location}` : name;
  return base
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special chars like & or '
    .replace(/[\s_-]+/g, '-') // Replace spaces/underscores with dashes
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing dashes
}