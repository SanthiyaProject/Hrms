import React, { useState } from "react";
import closeIcon from "../assets/close-icon.svg";
import editIcon from "../assets/edit.svg";
import deleteIcon from "../assets/delete.svg";
import PermissionDeleteModal from "./PermissionDeleteModal";
import { jwtDecode } from "jwt-decode";
const PermissionEditModal = ({
  modalHanlder,
  closeEditModalAndOpenDeleteModal,
  selectedPermission,
}) => {

  
  return (
    <>
      <div className="z-[100] lato fixed top-[15%] left-[50%] translate-x-[-50%] bg-white rounded-lg w-[90%] sm:w-[560px] p-4">
        <div className="header flex items-center justify-between border-bottom pb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg ">Approval / Rejected Permission Details</h1>
            <div
              className={
                selectedPermission.status == "approved"
                  ? "rounded-lg px-2 py-1 bg-green-100  text-green-400"
                  : "rounded-lg px-2 py-1 bg-red-100 text-red-400"
              }
            >
              {selectedPermission.status}
            </div>
          </div>
          <div
            onClick={modalHanlder}
            className="close-section cursor-pointer  bg-gray-200 p-2 rounded-full w-fit"
          >
            <img src={closeIcon} alt="" />
          </div>
        </div>
        <div className="content-container flex items-start justify-between mt-2">
          <table>
            <tr>
              <td className="font-semibold">Permission Date : </td>
              <td className="pl-3">{selectedPermission.date}</td>
            </tr>
            <tr>
              <td className="font-semibold pt-4"> From : </td>
              <td className="pl-3 pt-4">{selectedPermission.time_from}</td>
            </tr>
            <tr>
              <td className="font-semibold pt-4"> To : </td>
              <td className="pl-3 pt-4">{selectedPermission.time_to}</td>
            </tr>
            <tr>
              <td className="font-semibold pt-4"> Reason : </td>
              <td className="pl-3 pt-4">{selectedPermission.notes}</td>
            </tr>
          </table>
          <div className="button-section flex items-center gap-2">
            {/* <button className="bg-[#69d997] text-white font-semibold text-md px-6 py-2 rounded-lg flex items-center gap-2">
              <span>
                <img src={editIcon} alt="" />
              </span>{" "}
              Edit
            </button> */}
            <button
              onClick={() => {
                closeEditModalAndOpenDeleteModal();
              }}
              className="bg-red-400 text-white font-semibold text-md px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {" "}
              <span>
                <img src={deleteIcon} alt="" />
              </span>{" "}
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="permission-tint fixed top-0 right-0 bottom-0 left-0"></div>
    </>
  );
};

export default PermissionEditModal;
