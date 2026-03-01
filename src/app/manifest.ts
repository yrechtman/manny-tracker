import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Manny Behavior Tracker',
    short_name: 'Manny',
    description: 'Track and analyze Manny\'s behavioral data',
    start_url: '/',
    display: 'standalone',
    background_color: '#f9fafb',
    theme_color: '#4f46e5',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
}
