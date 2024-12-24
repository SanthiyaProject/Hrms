import React, { Component } from "react";

class ApprovalModal extends Component {
  render() {
    const { open, onClose, leaveDetails, onApprove } = this.props;

    if (!open) return null;

    return (
      <>
        <div className="modal fixed z-[100] top-[20%] left-[50%] translate-x-[-50%] bg-white w-[400px] shadow-2xl p-5 space-y-4 rounded-lg">
          <div className="header border-bottom pb-4">
            <h2 className="font-semibold text-lg">Leave Approval</h2>
          </div>
          <table className="line-height-300">
            <tr>
              <td className="font-semibold text-lg">Employee Name :</td>
              <td className="pl-3 text-lg">{leaveDetails.user_name}</td>
            </tr>
            <tr>
              <td className="font-semibold text-lg">From :</td>
              <td className="pl-3 text-lg">{leaveDetails.fromDate}</td>
            </tr>
            <tr>
              <td className="font-semibold text-lg">To :</td>
              <td className="pl-3 text-lg">{leaveDetails.toDate}</td>
            </tr>
          </table>
          <div className="button-section flex items-center gap-3">
            <button
              onClick={onApprove}
              className="bg-green-400 px-2 py-2 rounded-lg font-semibold text-white"
            >
              Approve Leave
            </button>
            <button
              onClick={onClose}
              className="bg-gray-200 px-2 py-2 rounded-lg font-semibold text-black"
            >
              Close
            </button>
          </div>
        </div>
        <div className="shade fixed top-0 right-0 bottom-0 left-0 "></div>
      </>
    );
  }
}

export default ApprovalModal;
