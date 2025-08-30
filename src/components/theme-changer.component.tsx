import React from 'react';
import { useTheme } from 'next-themes';
import 'tailwindcss/tailwind.css';
import { Icons } from './icons';

const ThemeChanger = () => {
  const themes = [
    'light',
    'dark',
    'cupcake',
    'bumblebee',
    'emerald',
    'corporate',
    'synthwave',
    'retro',
    'cyberpunk',
    'valentine',
    'halloween',
    'garden',
    'forest',
    'aqua',
    'lofi',
    'pastel',
    'fantasy',
    'wireframe',
    'black',
    'luxury',
    'dracula',
    'cmyk',
    'autumn',
    'business',
    'acid',
    'lemonade',
    'night',
    'coffee',
    'winter'
  ];
  const [isOpened, setIsOpened] = React.useState(false);
  const themeMenu = React.useRef<HTMLDivElement>(null);

  const [mounted, setMounted] = React.useState(false);
  const { theme, setTheme } = useTheme();
  const handleDropdown = () => {
    if (document.activeElement instanceof HTMLElement && isOpened) {
      document.activeElement.blur();
      setIsOpened(false);
    } else {
      setIsOpened(true);
    }
  };
  const changeTheme = (theme: string) => {
    if (mounted && themeMenu.current) {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
        setIsOpened(false);
      }
      setTheme(theme);
    }
  };
  React.useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return null;
  }
  return (
    <div
      title="Change Theme"
      ref={themeMenu}
      className="dropdown dropdown-end "
    >
      <div
        tabIndex={0}
        onClick={handleDropdown}
        className="gap-1 normal-case btn btn-ghost"
      >
        <Icons.colorSwatch className="w-5 h-5" />
        <span className="hidden font-normal md:inline">Theme</span>
        <Icons.chevronDown className="hidden w-5 h-5 fill-current opacity-60 sm:inline-block" />
        <span className="hidden lg:inline_notreally">Theme</span>
      </div>
      <div className="dropdown-content bg-base-200 text-base-content rounded-t-box rounded-b-box top-px max-h-96 h-[70vh] w-52 overflow-y-auto shadow-2xl mt-16 z-50">
        <div className="grid grid-cols-1 gap-3 p-3" tabIndex={0}>
          {themes.map((theme) => (
            <div
              onClick={() => changeTheme(theme)}
              key={theme}
              className="overflow-hidden rounded-lg outline-base-content outline outline-2 outline-offset-2"
            >
              <div
                data-theme={theme}
                className="w-full font-sans cursor-pointer bg-base-100 text-base-content"
              >
                <div className="grid grid-cols-5 grid-rows-3">
                  <div className="flex col-span-5 row-span-3 row-start-1 gap-1 px-4 py-3">
                    <div className="flex-grow text-sm font-bold">{theme}</div>
                    <div className="flex flex-wrap flex-shrink-0 gap-1">
                      <div className="w-2 rounded bg-primary" />
                      <div className="w-2 rounded bg-secondary" />
                      <div className="w-2 rounded bg-accent" />
                      <div className="w-2 rounded bg-neutral" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ThemeChanger;
