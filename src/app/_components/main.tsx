import Link from "next/link";

const Main = () => {
  return (
    <div className="flex gap-2">
      <button className="bg-gray-300 p-2 rounded-lg font-semibold">
        <Link href="/server-side-google-drive">Server Side Google Drive</Link>
      </button>
      <button className="bg-gray-300 p-2 rounded-lg font-semibold">
        <Link href="/client-side-google-drive">Client Side Google Drive</Link>
      </button>
    </div>
  );
};

export default Main;
