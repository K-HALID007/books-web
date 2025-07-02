"use client";
import { Suspense } from 'react';
import SignInForm from './signin-form';

// Loading component for the suspense fallback
const SignInFormLoading = () => {
  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="space-y-6">
          {/* Email Field Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-24 mb-2 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Password Field Skeleton */}
          <div>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse"></div>
            <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Submit Button Skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        </div>

        {/* Sign Up Link Skeleton */}
        <div className="mt-6 text-center">
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

const SignInFormWrapper = () => {
  return (
    <Suspense fallback={<SignInFormLoading />}>
      <SignInForm />
    </Suspense>
  );
};

export default SignInFormWrapper;