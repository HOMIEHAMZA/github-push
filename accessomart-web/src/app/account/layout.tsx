'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  User, 
  Package, 
  MapPin, 
  Heart, 
  LogOut, 
  ChevronRight,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/account', icon: User },
  { name: 'Order History', href: '/account/orders', icon: Package },
  { name: 'Addresses', href: '/account/addresses', icon: MapPin },
  { name: 'Wishlist', href: '/account/wishlist', icon: Heart },
];

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, isLoading, error } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || (!isAuthenticated && !error)) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center space-y-6">
        <div className="w-12 h-12 border-t-2 border-[#00f2ff] rounded-full animate-spin"></div>
        <p className="text-white/40 text-sm font-medium tracking-widest uppercase animate-pulse">Synchronizing with Mainframe...</p>
      </div>
    );
  }

  if (error && !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-red-400/10 flex items-center justify-center mb-6 border border-red-400/20">
          <AlertCircle className="w-10 h-10 text-red-400" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Access Refused</h1>
        <p className="text-white/60 max-w-md mb-8">
          The security layer encountered an anomaly: <span className="text-red-400/80">{error}</span>. This usually happens during high traffic or rate limiting.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => useAuthStore.getState().fetchMe()}
            className="flex items-center gap-2 px-8 py-3 bg-[#00f2ff] text-black font-bold rounded-xl hover:bg-cyan-400 transition-all"
          >
            <RefreshCcw className="w-4 h-4" />
            Retry Authorization
          </button>
          <Link 
            href="/login"
            className="px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all"
          >
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden backdrop-blur-xl">
              {/* User Header */}
              <div className="p-6 border-b border-white/5 bg-gradient-to-br from-[#1a1a1a] to-[#111]">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#00f2ff] to-[#7000ff] flex items-center justify-center font-bold text-lg text-white">
                    {user?.firstName[0]}{user?.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate capitalize">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <nav className="p-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center space-x-3 px-4 py-3 rounded-xl text-sm transition-all duration-300
                        ${isActive 
                          ? 'bg-gradient-to-r from-[#00f2ff]/10 to-transparent text-[#00f2ff] border border-[#00f2ff]/20' 
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                        }
                      `}
                    >
                      <item.icon className={`w-5 h-5 ${isActive ? 'text-[#00f2ff]' : ''}`} />
                      <span className="flex-1 font-medium">{item.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4" />}
                    </Link>
                  );
                })}

                <div className="mt-4 pt-4 border-t border-white/5">
                  <button
                    onClick={() => logout()}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-400/5 transition-all duration-300"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Quick Stats/Badges */}
            <div className="mt-6 p-6 bg-gradient-to-br from-[#111] to-[#0a0a0a] border border-white/5 rounded-2xl">
              <div className="flex items-center space-x-2 text-[#00f2ff] mb-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Trusted Member</span>
              </div>
              <p className="text-[10px] text-white/40">
                Verified account since {new Date(user?.createdAt || '').toLocaleDateString()}
              </p>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
