import React from "react";
import { useState } from "react";
import close from "../assets/close-icon.svg";
import axios from "axios";
const PermissionRejectModal = ({ closePermissionReject, rejectDetails }) => {
  const [reasonForRejecting, setReasonForRejecting] = useState("");
  const token = localStorage.getItem("jwtToken");

  const handleReject = async () => {
    if (!reasonForRejecting) {
      alert("Please provide a reason for rejection.");
      return;
    }

    try {
      const response = await axios.put(
        `http://127.0.0.1:8000/api/permission/update/${rejectDetails.permission_id}/`,
        { status: "rejected", notes: reasonForRejecting }, // Send reason with rejection
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("status : rejected", "notes : ", reasonForRejecting )
      if (response.status === 200) {
        console.log("Permission rejected successfully:", response.data);
        alert("Permission rejected successfully!");
        closePermissionReject(); // Close the modal after successful rejection
      } else {
        console.error("Failed to reject permission:", response.statusText);
        alert("Failed to reject the permission. Please try again.");
      }
    } catch (error) {
      console.error("Error while rejecting permission:", error);
      alert("An error occurred. Please try again.");
    }

    // Optionally reload or refresh data
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };
  return (
    <>
      <div className="main-container p-4 fixed  rounded-lg z-[200] top-[20%] left-[50%] translate-x-[-50%] bg-white w-[90%] sm:w-[400px]">
        <div className="header border-bottom pb-3 flex items-center justify-between">
          <h1 className="font-medium text-lg">Reject Permission Details</h1>
          <div
            onClick={closePermissionReject}
            className="close-section cursor-pointer bg-gray-200 w-fit p-2 rounded-full"
          >
            <img src={close} alt="" />
          </div>
        </div>
        <div className="content-container">
          <table>
            <tr>
              <td className="font-semibold">Employee Name</td>
              <td className="pl-4">{rejectDetails.user_name}</td>
            </tr>
            <tr>
              <td className="font-semibold">Date</td>
              <td className="pl-4">{rejectDetails.date}</td>
            </tr>
            <tr>
              <td className="font-semibold">From</td>
              <td className="pl-4">{rejectDetails.time_from}</td>
            </tr>
            <tr>
              <td className="font-semibold">To</td>
              <td className="pl-4">{rejectDetails.time_to}</td>
            </tr>
          </table>
        </div>
        <div className="text-field-container mt-3">
          <h1 className="font-medium text-lg">Reason for Rejecting : </h1>
          <textarea
            value={reasonForRejecting}
            onChange={(e) => {
              setReasonForRejecting(e.target.value);
            }}
            className="w-[100%] p-3 rounded-lg border border-gray-400  mt-3"
            placeholder="Enter Reason"
          ></textarea>
        </div>
        <button onClick={handleReject} className="mt-2 px-8 rounded-lg py-1 font-semibold text-lg bg-red-400 text-white">
          Reject
        </button>
      </div>
      <div className="permission-tint fixed top-0 right-0 left-0 bottom-0"></div>
    </>
  );
};

export default PermissionRejectModal;
