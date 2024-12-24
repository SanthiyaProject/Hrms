import React, { useState } from "react";
import deleteIcon from "../assets/delIcon.svg";
const PermissionDeleteModal = ({ closeDeleteModal, selectedPermission,deletePermission }) => {
  const permissionId = selectedPermission.permission_id;
  console.log("permission id : ", permissionId);
  const handleDelete = async () => {
    try {
      await deletePermission(permissionId); // Call delete function with permission ID
      closeDeleteModal(); // Close modal after deletion
    } catch (error) {
      console.error("Failed to delete permission:", error);
      // You might want to handle error state here
    }
  };
  return (
    <>
      <div className="main-container  w-[90%] sm:w-[450px] p-4 rounded-lg bg-white absolute top-[20%] left-[50%] translate-x-[-50%] z-[200]">
        <div className="header border-bottom py-2">
          <h1 className="font-semibold text-lg">Delete Confirmation</h1>
        </div>
        <div className="content-container text-center mt-4">
          <img src={deleteIcon} className="w-fit m-auto" />
          <h1 className="font-semibold text-lg mt-2">Are you sure ?</h1>
          <h1 className="font-semibold text-lg mt-2">
            Are you surely want to delete this item ?
          </h1>
          <div className="button-section flex items-center gap-3 justify-center mt-3">
            <button onClick={handleDelete} className="delete-btn bg-[#d75378] hover:bg-pink-600 transition-all duration-300 px-4 py-2 font-semibold text-white rounded-lg">
              Delete
            </button>
            <button
              onClick={closeDeleteModal}
              className="cancel-btn border  font-semibold px-4 py-2 rounded-lg"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
      <div className="permission-tint fixed top-0 right-0 left-0 bottom-0"></div>
    </>
  );
};

export default PermissionDeleteModal;
