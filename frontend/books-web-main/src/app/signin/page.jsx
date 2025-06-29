import Navbar from "@/components/home/navbar/navbar";
import SignInHeader from "@/components/auth/signin-header";
import SignInForm from "@/components/auth/signin-form";

const SignInPage = () => {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F4EDE4] pt-20">
        <SignInHeader />
        <SignInForm />
      </div>
    </>
  );
};

export default SignInPage;