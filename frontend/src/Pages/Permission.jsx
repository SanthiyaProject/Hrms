import React from "react";
import MyDetailsSidebar from "../components/MyDetailsSidebar";
import Navbar from "../components/Navbar";
import PermissionStatCard from "../components/PermissionStatCard";
import PermissionTable from "../components/PermissionTable";

const Permission = () => {
  return (
    <>
      <div className="main-container">
        <Navbar />
        <div className="container-1 mt-4 flex gap-4">
          <MyDetailsSidebar />
          <div className="main-container border rounded-lg w-[100%] p-4">
            <PermissionStatCard />
            <PermissionTable />
          </div>
        </div>
      </div>
    </>
  );
};

export default Permission;
