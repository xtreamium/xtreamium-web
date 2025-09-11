import ServerDetails from "@/components/server-details.component";
import React from "react";

const AddServerPage: React.FC = () => {
  return (
    <div className="flex flex-row items-center justify-center min-w-full mt-14">
      <div className="w-2/3">
        <ServerDetails />
      </div>
    </div>
  );
};

export default AddServerPage;
