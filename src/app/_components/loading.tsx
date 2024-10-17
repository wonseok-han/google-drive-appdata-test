const Loading = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-500 border-solid"></div>
    </div>
  );
};

export default Loading;
