import React from "react";

interface ISidebarProvider {
  children: React.ReactNode;
}
interface ISidebarProviderContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}
export const SidebarContext = React.createContext<ISidebarProviderContext>({
  isSidebarOpen: true,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export const SidebarProvider = ({ children }: ISidebarProvider) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false); // Start with false for mobile
  const [isInitialized, setIsInitialized] = React.useState(false);

  // Handle responsive behavior
  React.useEffect(() => {
    const handleResize = () => {
      const isLargeScreen = window.innerWidth >= 1024;
      
      if (!isInitialized) {
        // Initial setup based on screen size
        setIsSidebarOpen(isLargeScreen);
        setIsInitialized(true);
      } else {
        // Only auto-open on larger screens during resize, don't auto-close on mobile
        if (isLargeScreen) {
          setIsSidebarOpen(true);
        }
        // Note: We don't auto-close on mobile to allow manual toggle
      }
    };

    // Set initial state based on screen size
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isInitialized]);

  const _toggleSidebar = () => {
    console.log('Toggle sidebar called, current state:', isSidebarOpen);
    setIsSidebarOpen(!isSidebarOpen);
  };
  const _closeSidebar = () => {
    console.log('Close sidebar called');
    setIsSidebarOpen(false);
  };

  const value = React.useMemo(
    () => ({
      isSidebarOpen,
      toggleSidebar: _toggleSidebar,
      closeSidebar: _closeSidebar,
    }),
    [isSidebarOpen]
  );

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
