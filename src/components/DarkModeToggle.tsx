import { Moon, Sun } from 'lucide-react';

interface Props {
  isDark: boolean;
  toggle: () => void;
  className?: string;
}

const DarkModeToggle = ({ isDark, toggle, className = '' }: Props) => {
  return (
    <button
      onClick={toggle}
      className={`relative w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 hover:bg-white/10 ${className}`}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber" />
      ) : (
        <Moon className="w-5 h-5 text-navy" />
      )}
    </button>
  );
};

export default DarkModeToggle;
