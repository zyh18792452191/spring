export function CampLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src="/logo.png"
        alt="市场运营平台LOGO"
        className="h-10 w-10 object-contain"
      />
      <div className="flex flex-col">
        <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
          市场运营平台
        </span>
        <span className="text-[10px] text-gray-500 -mt-1 tracking-wide">
          MARKET OPERATION
        </span>
      </div>
    </div>
  );
}
