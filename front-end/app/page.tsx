'use client';

import Link from 'next/link';
import { Chrome, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#14142B]">Sign in to ModalX</h1>
          <p className="mt-2 text-gray-600">Your creative journey starts here</p>
        </div>

        <button
          className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Chrome className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or sign in with email</span>
          </div>
        </div>

        <form className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#14142B] focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <Link href="/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
                Forgot?
              </Link>
            </div>
            <div className="mt-1 relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#14142B] focus:border-transparent"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <EyeOff className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#14142B] text-white py-2.5 rounded-lg hover:bg-[#1a1a3a] transition-colors"
          >
            Sign in
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-[#14142B] hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
