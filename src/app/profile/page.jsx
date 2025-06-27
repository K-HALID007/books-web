import Navbar from "@/components/home/navbar/navbar";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileForm from "@/components/profile/profile-form";
import ProtectedRoute from "@/components/auth/protected-route";

const ProfilePage = () => {
  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F4EDE4] pt-20">
          <ProfileHeader />
          <ProfileForm />
        </div>
      </ProtectedRoute>
    </>
  );
};

export default ProfilePage;