import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return `${num / 1000}k+`;
  }
  return `${num}+`;
}

export function getCategoryIcon(category: string): string {
  switch (category.toLowerCase()) {
    case 'gt':
      return 'fa-trophy';
    case 'gt3':
      return 'fa-trophy';
    case 'sport':
      return 'fa-car-side';
    case 'jdm':
      return 'fa-car';
    case 'f1':
      return 'fa-flag-checkered';
    case 'drift':
      return 'fa-wind';
    case 'rally':
      return 'fa-mountain';
    case 'touge':
      return 'fa-road';
    case 'street':
      return 'fa-road';
    case 'freestyle':
      return 'fa-star';
    default:
      return 'fa-car';
  }
}

export function getRandomUserCount(max: number): number {
  return Math.floor(Math.random() * max) + 1;
}

export function getOnlineStatus(): boolean {
  // In a real app, this would check actual server status
  return Math.random() > 0.2; // 80% chance of being online
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export const trackExternalLink = (url: string) => {
  // This would normally track outbound link clicks in analytics
  window.open(url, '_blank', 'noopener,noreferrer');
};

export const downloadFile = async (url: string, filename: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    // In a real app, we would handle the actual file download here
    // For now, we'll just fake a successful download notification
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};
