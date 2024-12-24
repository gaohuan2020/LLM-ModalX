'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, LayoutGrid, Settings, User, Brain } from 'lucide-react';
import adGif from '../../app/R.gif';

const navItems = [
  { icon: Home, href: '/', label: 'Home' },
  { icon: User, href: '/datacapsule', label: 'ModalX Capsule' },
  { icon: LayoutGrid, href: '/datacollection', label: 'ModalX Collection' },
  { icon: Brain, href: '/datacreate', label: 'ModalX Creation' },
  { icon: BookOpen, href: '/datacsearch', label: 'ModalX Search' },
  { icon: Settings, href: '/settings', label: 'Settings' }
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="hidden lg:flex flex-col">
      <aside className="w-[300px] bg-[#14142B] text-white flex flex-col min-h-screen">
        <div className="p-6 flex items-center gap-2">
          <Brain className="w-6 h-6" />
          <h2 className="text-xl font-semibold">ModalX Studio</h2>
        </div>

        <nav className="flex-1 py-6">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-6 py-3 text-lg ${isActive ? 'bg-white/10' : 'hover:bg-white/5'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="w-[300px]">
          <Image
            src={adGif}
            alt="Advertisement Animation"
            width={300}
            height={600}
            className="w-full h-[600px] object-cover brightness-90"
            unoptimized
          />
        </div>
      </aside>
    </div>
  );
}
