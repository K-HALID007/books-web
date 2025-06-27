import UploadHeader from "@/components/upload/upload-header";
import UploadForm from "@/components/upload/upload-form";
import Navbar from "@/components/home/navbar/navbar";
import Footer from "@/components/home/footer/footer";
import ProtectedRoute from "@/components/auth/protected-route";

const UploadPage = () => {
  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <div className="min-h-screen bg-[#F4EDE4] pt-20">
          <UploadHeader />
          <UploadForm />
          <Footer />
        </div>
      </ProtectedRoute>
    </>
  );
};

export default UploadPage;