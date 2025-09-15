import { Icons } from "@/components/icons";
import React from "react";

type LoadingProps = {
  children?: React.ReactNode;
};

const Loading: React.FC<LoadingProps> = ({ children }) => {
  return <Icons.loader className="animate-spin p-1"> {children}</Icons.loader>;
};

export default Loading;
