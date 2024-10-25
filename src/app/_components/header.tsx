"use client";

import Link from "next/link";

const Header = () => {
  return (
    <header className="px-4 py-3 w-full flex-none">
      <div>
        <nav>
          <button className="bg-gray-300 p-2 rounded-full font-semibold">
            <Link href="/">Home</Link>
          </button>
        </nav>
        <span className="flex justify-center font-black text-3xl">
          Google Drive AppData Test
        </span>
      </div>
    </header>
  );
};

export default Header;
