'use client';

import { Bell, Settings, Search, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  const isCourses = pathname?.startsWith('/Data Capsule');

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="h-16 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="lg:hidden">
            <Menu className="w-6 h-6 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-lg">ModalX</span>
            {isCourses && (
              <span className="text-gray-500 text-sm hidden sm:inline">
                / Data Capsule
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search your data ..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Bell className="w-6 h-6" />
          </button>
          <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </div>
    </header>
  );
}
