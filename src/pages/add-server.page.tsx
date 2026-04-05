import ServerDetails from "@/components/server-details.component";
import React from "react";
import { useParams } from "react-router-dom";

const AddServerPage: React.FC = () => {
  const { serverId } = useParams<{ serverId: string }>();

  return (
    <div className="flex flex-row items-center justify-center min-w-full mt-14">
      <div className="w-2/3">
        <ServerDetails serverId={serverId} />
      </div>
    </div>
  );
};

export default AddServerPage;
