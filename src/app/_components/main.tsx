"use client";

export default function Main() {
  const handleGenerate = async () => {
    console.log("handleGenerate");
  };

  const handleStore = async () => {
    console.log("handleStore");
  };

  const handleRead = async () => {
    console.log("handleRead");
  };

  return (
    <div className="flex gap-2">
      <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleGenerate}
      >
        Keypair Generate
      </button>
      <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleStore}
      >
        Drive Store
      </button>
      <button
        className="bg-gray-300 p-2 rounded-lg font-semibold"
        onClick={handleRead}
      >
        Key Read
      </button>
    </div>
  );
}
