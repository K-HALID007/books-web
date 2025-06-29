import { User } from "lucide-react";

const ProfileHeader = () => {
  return (
    <div className="bg-[#F4EDE4] border-b border-[#E0D5C7] py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-[#5D4037] flex items-center justify-center gap-4 mb-4">
          <User className="w-12 h-12 text-[#A47148]" />
          My Profile
        </h1>
        <p className="text-[#6B4F3F] text-lg">
          View and update your account information
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;