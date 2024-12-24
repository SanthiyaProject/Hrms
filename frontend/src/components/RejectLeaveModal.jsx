import React, { useState } from "react";
import closeIcon from "../assets/close-icon.svg";

const RejectLeaveModal = ({
  openRejectModal,
  setOpenRejectModal,
  selectedLeave,
  leavDetails,
  rejectTint,
  setRejectTint,
  handleRejectLeave, // This is the function to handle rejection
}) => {
  const [rejectReason, setRejectReason] = useState(""); // State to store the reason
  
  return (
    <>
      <div className="reject-modal h-fit w-[90%] md:w-[80%] p-3 shadow-lg bg-white fixed top-10 left-[50%] translate-x-[-50%] rounded-lg z-[100]">
        <div className="header border-bottom pb-2 flex items-center justify-between">
          <h1 className="font-semibold">Deny Leave Request</h1>
          <div
            onClick={() => {
              setOpenRejectModal(false);
            }}
            className="close-btn bg-gray-100 p-2 rounded-full"
          >
            <img src={closeIcon} alt="" />
          </div>
        </div>
        <div className="content-container mt-2 ">
          <table className="">
            <tr className="line-height">
              <td className="font-semibold">Employee Name :</td>
              <td className="pl-2">{leavDetails.user_name}</td>
            </tr>
            <tr className="line-height">
              <td className="font-semibold">Leave Date :</td>
              <td className="pl-2">
                {leavDetails.fromDate} - {leavDetails.toDate}
              </td>
            </tr>
            <tr className="line-height">
              <td className="font-semibold">Requested On :</td>
              <td className="pl-2">{leavDetails.created_at.slice(0, 10)}</td>
            </tr>
            <tr className="line-height">
              <td className="font-semibold">Leave Type:</td>
              <td className="pl-2">{leavDetails.leave_type}</td>
            </tr>
            <tr className="line-height">
              <td className="font-semibold">Notes :</td>
              <td className="pl-2">{leavDetails.notes}</td>
            </tr>
          </table>
        </div>
        {/* ----------reason-for-rejecting---------- */}
        <div className="container-1">
          <h1>Reason for Deny Leave Request :</h1>
          <textarea
            value={rejectReason} // Bind value to the state
            onChange={(e) => setRejectReason(e.target.value)} // Update state on change
            className="border-thick border rounded-lg p-2 w-[100%] mt-2"
          ></textarea>
          <div className="button-container flex items-center gap-3 justify-end mt-2 ">
            <button
              onClick={() => {
                setOpenRejectModal(false);
              }}
              className="px-3 py-2 bg-gray-100 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Call the function passed as prop to handle rejection
                handleRejectLeave(rejectReason);
                setOpenRejectModal(false);
              }}
              className="bg-blue-500 text-white font-semibold px-3 py-2 rounded-lg"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
      {rejectTint ? (
        <div className="delete-tint fixed w-full h-full top-0 right-0 bottom-0 left-0"></div>
      ) : (
        ""
      )}
    </>
  );
};

export default RejectLeaveModal;
