const LoadingState = () => {
  return (
    <div className="min-h-screen bg-[#F4EDE4] pt-20 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-[#6D4C41] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-[#5D4037]">Loading your books...</p>
      </div>
    </div>
  );
};

export default LoadingState;