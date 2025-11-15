import Link from "next/link";

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-transparent pointer-events-none z-50">
      <div className="relative flex justify-center pb-6">
        {/* Circular Scan & Pay Button */}
        <Link
          href="https://cpay-nine.vercel.app/scanner"
          className="pointer-events-auto group relative flex h-20 w-20 items-center justify-center rounded-full bg-purple-600 shadow-lg transition-all duration-300 hover:bg-purple-700 hover:scale-105 active:scale-95"
        >
          
          {/* QR Code Icon */}
          <div className="flex flex-col items-center justify-center text-white">
            <div className="mb-1 grid grid-cols-3 gap-0.5">
              {/* QR Code pattern */}
              <div className="h-1.5 w-1.5 bg-white rounded-sm"></div>
              <div className="h-1.5 w-1.5 bg-transparent"></div>
              <div className="h-1.5 w-1.5 bg-white rounded-sm"></div>
              <div className="h-1.5 w-1.5 bg-transparent"></div>
              <div className="h-1.5 w-1.5 bg-white rounded-sm"></div>
              <div className="h-1.5 w-1.5 bg-transparent"></div>
              <div className="h-1.5 w-1.5 bg-white rounded-sm"></div>
              <div className="h-1.5 w-1.5 bg-transparent"></div>
              <div className="h-1.5 w-1.5 bg-white rounded-sm"></div>
            </div>
            <span className="text-xs font-medium">Scan & Pay</span>
          </div>
          
          {/* Hover effect ring */}
          <div className="absolute inset-0 rounded-full border-2 border-purple-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
        </Link>
      </div>
    </footer>
  );
};

export default Footer;