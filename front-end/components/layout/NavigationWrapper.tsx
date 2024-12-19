'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function NavigationWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === '/' || pathname === '/signup';

  if (isAuthPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
