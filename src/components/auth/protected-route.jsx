"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Add a small delay to show the message before redirecting
      const timer = setTimeout(() => {
        router.push('/signin');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loading, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#5D4037] font-medium">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated before redirecting
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-[#FFD180] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#5D4037]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#5D4037] mb-3">Authentication Required</h2>
          <p className="text-[#6B4F3F] mb-6">
            You need to sign in to access your books. Redirecting to sign in page...
          </p>
          <div className="w-6 h-6 border-2 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;