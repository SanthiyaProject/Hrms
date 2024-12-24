import React, { useState } from "react";
import close from "../assets/close-icon.svg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const PermissionApproveModal = ({ approveDetails, closeApproveModal }) => {
  const token = localStorage.getItem("jwtToken");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
const [success, setSuccess] = useState(false)
  const handleApprove = async () => {
    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/permission/update/${approveDetails.permission_id}/`,
        { status: "approved" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        console.log("Permission updated successfully:", response.data);
        alert("Permission approved successfully!");
        // setSuccess(true);
        // setTimeout(() => {
        //   setSuccess(false)
        // }, 1000);
        closeApproveModal(); // Close the modal after successful approval
      } else {
        console.error("Failed to update permission:", response.statusText);
        alert("Failed to approve the permission. Please try again.");
      }
    } catch (error) {
      console.error("Error while updating permission:", error);
      alert("An error occurred. Please try again.");
    }
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <>
      {success ? <div className="bg-green-400 text-white font-semibold px-4 py-2 rounded-lg absolute z-[200] right-0 top-[15%]">Permission approved successfully!!</div> : ""}
      <div className="main-container w-[90%] sm:w-[400px] z-[200] fixed top-[20%] left-[50%] translate-x-[-50%] bg-white p-4 rounded-lg shadow-lg">
        <div className="header flex items-center justify-between border-bottom pb-3">
          <h1 className="font-semibold">Approving Permission for : </h1>
          <div
            onClick={closeApproveModal}
            className="close-section bg-gray-100 p-2 w-fit rounded-full"
          >
            <img src={close} alt="" />
          </div>
        </div>
        <div className="card-container mt-3">
          <table>
            <tr>
              <td className="font-semibold">Date : </td>
              <td className="pl-4">{approveDetails.date}</td>
            </tr>
            <tr>
              <td className="font-semibold">From : </td>
              <td className="pl-4">{approveDetails.time_from}</td>
            </tr>
            <tr>
              <td className="font-semibold">To: </td>
              <td className="pl-4">{approveDetails.time_to}</td>
            </tr>
          </table>
          <button
            onClick={handleApprove}
            className="bg-green-400 hover:bg-green-500 text-white font-semibold mt-3 px-8 py-1 text-lg rounded-lg"
          >
            Approve
          </button>
        </div>
      </div>
      <div className="permission-tint fixed top-0 right-0 left-0 bottom-0"></div>
    </>
  );
};

export default PermissionApproveModal;
