"use client";
import Navbar from "@/components/home/navbar/navbar";
import MyLibraryMain from "@/components/my-library/my-library-main";
import ProtectedRoute from "@/components/auth/protected-route";

const MyLibraryPage = () => {
  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <MyLibraryMain />
      </ProtectedRoute>
    </>
  );
};

export default MyLibraryPage;