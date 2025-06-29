import Navbar from "@/components/home/navbar/navbar";
import SignUpHeader from "@/components/auth/signup-header";
import SignUpForm from "@/components/auth/signup-form";

const SignUpPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F4EDE4] pt-20">
        <SignUpHeader />
        <SignUpForm />
      </div>
    </>
  );
};

export default SignUpPage;