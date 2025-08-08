type MixerButtonProps = {
  isOpen: boolean;
  onClick: () => void;
};

export default function MixerButton({ isOpen, onClick }: MixerButtonProps) {
  return (
    <button
      aria-label="Menu"
      onClick={onClick}
      className="relative z-50 flex items-center justify-center w-20 h-20 text-coffee-900/80 group"
    >
      <div className="relative w-8 h-8 flex justify-between">
        {/* Left Line */}
        <div className="relative w-[2px] h-full bg-current">
          <span
            className={`
              absolute left-1/2 block w-2 h-2 -translate-x-1/2 rounded-full border-2 border-current bg-coffee-900
              transition-all duration-500 ease-in-out
              ${isOpen ? "top-1/4" : "top-3/4 group-hover:top-1/2"}
            `}
          />
        </div>

        {/* Middle Line */}
        <div className="relative w-[2px] h-full bg-current/50"></div>

        {/* Right Line */}
        <div className="relative w-[2px] h-full bg-current">
          <span
            className={`
              absolute left-1/2 block w-2 h-2 -translate-x-1/2 rounded-full border-2 border-current bg-coffee-900
              transition-all duration-500 ease-in-out
              ${isOpen ? "top-3/4" : "top-1/4 group-hover:top-1/2"}
            `}
          />
        </div>
      </div>
    </button>
  );
}
