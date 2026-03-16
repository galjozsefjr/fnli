'use client'
import dynamic from 'next/dynamic';

// due to oversimplified login mechanism we have to disable ssr
export default function Home() {
  const HomePage = dynamic(() => import('@/components/home/HomePage'), { ssr: false });
  return <HomePage />;
}
