'use client';

import dynamic from 'next/dynamic';

const CustomCursor  = dynamic(() => import('./CustomCursor'),  { ssr: false });
const GlobalEffects = dynamic(() => import('./GlobalEffects'), { ssr: false });

export default function ClientProviders() {
  return (
    <>
      <CustomCursor />
      <GlobalEffects />
    </>
  );
}
