import React from "react";

interface IMainProps {
  children: React.ReactNode;
}
const Main = ({ children }: IMainProps) => {
  return (
    <main className="flex-1 pb-16 overflow-y-auto">
      <div className="container grid px-6 mx-auto">{children}</div>
    </main>
  );
};

export default Main;
