import Navbar from "@/components/home/navbar/navbar";
import SignInHeader from "@/components/auth/signin-header";
import SignInFormWrapper from "@/components/auth/signin-form-wrapper";

const SignInPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F4EDE4] pt-20">
        <SignInHeader />
        <SignInFormWrapper />
      </div>
    </>
  );
};

export default SignInPage;