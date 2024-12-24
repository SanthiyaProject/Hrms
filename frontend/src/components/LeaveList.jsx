import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import leaves from "../assets/leaves.svg";
import sickLeave from "../assets/sick-leave.svg";
import vacationLeave from "../assets/vacation-leave.svg";
import search from "../assets/search-icon.svg";
import plus from "../assets/plus-icon.svg";
import LeaveListTable from "./LeaveListTable";
import { jwtDecode } from "jwt-decode";
import closeIcon from "../assets/close-icon.svg";
import EditLeave from "./EditLeave";
import { Data } from "../context/store";
import { useContext } from "react";
import { v4 as uuidv4 } from "uuid";
const LeaveList = ({ showTint, setShowTint }) => {
  const token = localStorage.getItem("jwtToken");
  const decoded = jwtDecode(token);
  const user_id = decoded.user_id;
  const [openDeleteConfrimation, setOpenDeleteConfirmation] = useState(false);
  const [deleteTint, setDeleteTint] = useState(false);
  const { employeeLeaveDetails, setEmployeeLeaveDetails, userName } =
    useContext(Data);
  const { deletingLeaveId, setDeletingLeaveId } = useContext(Data);
  // const [filterStatus, setFilterStatus] = useState("");
  const [selectedTime, setSelectedTime] = useState("fullDay");
  const [newSickLeave, setNewSickLeave] = useState(7);
  const [newCasualLeave, setNewCasualLeave] = useState(12);
  const [newVacationLeave, setNewVacationLeave] = useState(6);
  const [LOP, setLOP] = useState(0);

  const [sickLeaveCount, setSickLeaveCount] = useState(0);
  const [casualLeaveCount, setCasualLeaveCount] = useState(0);
  const [vacationLeaveCount, setVacationLeaveCount] = useState(0);

  const [leaveCounts, setLeaveCounts] = useState({});

  const [dateErrorMessage, setDateErrorMessage] = useState(false);
  const [dateError, setDateError] = useState(""); // State for error message
  function handleCloseDeleteModal() {
    setOpenDeleteConfirmation(false);
    setDeleteTint(false);
  }
  console.log("Employee leave details :", employeeLeaveDetails);
  function handleDeleteModal() {
    // Make an API call to delete the leave from the database
    axios
      .delete(`http://127.0.0.1:8000/api/leave/delete/${deletingLeaveId}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("leave id :", deletingLeaveId);
        // If deletion was successful, filter the local state and update context
        const updatedLeaves = employeeLeaveDetails.filter(
          (leave) => leave.leave_id !== deletingLeaveId
        );
        setEmployeeLeaveDetails(updatedLeaves); // Update the context with filtered data
      })
      .catch((error) => {
        if (error.response && error.response.status === 403) {
          console.error("Error:", error.response.data.detail);
          alert(error.response.data.detail);
          // Show an error message or update UI here
        } else {
          console.error("Error:", error.message);
        }
      });

    setOpenDeleteConfirmation(false);
    setDeleteTint(false);
  }
  const handleDeleteLeave = (leaveId) => {
    setOpenDeleteConfirmation(true);
    setDeleteTint(true);
  };

  const [showLeaveApplyModal, setShowLeaveApplyModal] = useState(false);

  function handleTint() {
    setShowTint(true);
  }
  function handleCloseTint() {
    setShowTint(false);
  }
  function handleCloseModal() {
    setShowLeaveApplyModal(false);
  }
  function handleModal() {
    setShowLeaveApplyModal(true);
  }

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  const [filteredLeaves, setFilteredLeaves] = useState(employeeLeaveDetails);
  useEffect(() => {
    const filtered = employeeLeaveDetails.filter((leave) => {
      const leaveType = leave.leave_type || ""; // Default to empty string if undefined
      const leaveFromDate = leave.from || "";
      const leaveToDate = leave.to || "";
      const leaveReason = leave.reason || "";

      // Check if the search term is found in any of the relevant fields (leaveType, fromDate, toDate, reason)
      const matchesSearch =
        leaveType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveFromDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveToDate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        leaveReason.toLowerCase().includes(searchTerm.toLowerCase());

      // Filter by status if selected
      const matchesFilter =
        filterStatus === "" || leave.status === filterStatus;

      return matchesSearch && matchesFilter;
    });

    setFilteredLeaves(filtered); // Set the filtered leave data to be displayed
  }, [searchTerm, filterStatus, employeeLeaveDetails]);

  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    leaveType: "",
    timePeriod: selectedTime,
    notes: "",
    notify: "",
  });
  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    // Validate the dates if "fromDate" or "toDate" is changed
    if (name === "fromDate" || name === "toDate") {
      validateDates(
        name === "fromDate" ? value : formData.fromDate,
        name === "toDate" ? value : formData.toDate
      );
    }
  };

  const validateDates = (fromDate, toDate) => {
    if (fromDate && toDate && new Date(toDate) < new Date(fromDate)) {
      setDateError("To Date cannot be earlier than From Date.");
    } else {
      setDateError(""); // Clear the error if dates are valid
    }
  };

  const isDateOverlapping = (fromDate, toDate) => {
    const newFromDate = new Date(fromDate);
    const newToDate = new Date(toDate);

    return employeeLeaveDetails.some((leave) => {
      const existingFromDate = new Date(leave.fromDate);
      const existingToDate = new Date(leave.toDate);

      // Check for overlap
      return (
        (newFromDate >= existingFromDate && newFromDate <= existingToDate) ||
        (newToDate >= existingFromDate && newToDate <= existingToDate) ||
        (newFromDate <= existingFromDate && newToDate >= existingToDate)
      );
    });
  };

  const handleSubmitLeave = async () => {
    const token = localStorage.getItem("jwtToken");
    const decoded = jwtDecode(token);
    const user_id = decoded.user_id;
    const { fromDate, toDate } = formData;
    // Check for overlapping leave dates
    if (isDateOverlapping(fromDate, toDate)) {
      alert("You already have leave applied during the selected date range.");
      return; // Prevent submission
    }

    // Fetch the department from the first API call
    const getResponse = await axios.get(
      `http://127.0.0.1:8000/api/employees/${user_id}/`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const dept = getResponse.data.departmant;
    console.log("Department:", dept);
    // Prepare the data to be sent to the API
    const requestData = {
      leave_type: formData.leaveType,
      fromDate: formData.fromDate,
      user_id: user_id,
      toDate: formData.toDate,
      notes: formData.notes,
      notify: formData.notify,
      time_period: formData.timePeriod,
      user_name: userName,
      user_department: dept, // Pass the department here
      // status: "Pending",
    };
    console.log("requestData : ", requestData);
    if (dateError) {
      // Prevent submission if there is an error
      // alert("To date should not be earlier than the From date");
      setDateErrorMessage(true);
      setTimeout(() => {
        setDateErrorMessage(false);
      }, 2000);
      return;
    }
    axios
      .post("http://127.0.0.1:8000/api/leave/submit/", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const newLeave = response.data; // Assume the server responds with the saved leave data

        // Update the context state with the new leave
        setEmployeeLeaveDetails((prevDetails) => [...prevDetails, newLeave]);

        // Reset the form and close modal
        setFormData({
          fromDate: "",
          toDate: "",
          leaveType: "",
          timePeriod: "fullDay",
          notes: "",
          notify: "",
        });
        setShowLeaveApplyModal(false);
        handleCloseTint();
      })
      .catch((error) => {
        console.error("Error applying leave:", error);
        alert(error.response.data.error);
      });
  };

  useEffect(() => {
    // Helper function to calculate leave count by type
    const calculateLeaveCount = (type) => {
      return employeeLeaveDetails.reduce((total, leave) => {
        if (leave.status === "Approved" && leave.leave_type === type) {
          return (
            total +
            (leave.time_period === "firstHalf" ||
            leave.time_period === "secondHalf"
              ? 0.5
              : 1)
          );
        }
        return total;
      }, 0);
    };

    const calculateLOP = () => {
      const casualLeavesThisMonth = employeeLeaveDetails.filter(
        (leave) =>
          leave.leave_type === "Casual Leave" &&
          leave.status === "Approved" &&
          new Date(leave.date).getMonth() === new Date().getMonth()
      );

      const totalCasualLeaveDays = casualLeavesThisMonth.reduce(
        (total, leave) => {
          return (
            total +
            (leave.time_period === "firstHalf" ||
            leave.time_period === "secondHalf"
              ? 0.5
              : 1)
          );
        },
        0
      );

      return totalCasualLeaveDays > 3
        ? Math.floor((totalCasualLeaveDays - 3) / 3)
        : 0;
    };

    setSickLeaveCount(calculateLeaveCount("Sick Leave"));
    setCasualLeaveCount(calculateLeaveCount("Casual Leave"));
    setVacationLeaveCount(calculateLeaveCount("Annual Leave"));

    const lop = calculateLOP();
    setLOP(lop);
  }, [employeeLeaveDetails]);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/leave_count/${user_id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        console.log("leave count response :", response.data);
        setLeaveCounts(response.data);
      });
  }, []);

  return (
    <>
      <div className="main-container md:border w-[100%] h-[82vh] rounded-lg font-lato py-3 md:px-5 ">
        <div className="header">
          <h1 className="font-semibold text-lg">Leave List</h1>
        </div>

        <div className="grid mt-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <div className="sick-leave w-full flex items-center gap-3 bg-[#FCF4E9] p-4 rounded-lg">
            <div className="img-container bg-[#FFD59C] w-fit rounded-full p-2">
              <img src={sickLeave} className="w-6" />
            </div>
            <div>
              <h1 className="text-sm">Medical Leave Available</h1>
              <p className="font-semibold">
                {/* {Math.max(0, newSickLeave - sickLeaveCount)} */}
                {leaveCounts.Medical_Leave}
              </p>
            </div>
          </div>

          <div className="casual-leave w-full flex items-center gap-3 bg-[#E2E9F3] p-4 rounded-lg">
            <div className="img-container bg-[#BFCFD7] w-fit rounded-full p-2">
              <img src={leaves} className="w-6" />
            </div>
            <div>
              <h1 className="text-sm">Casual Leave Available</h1>
              {/* {Math.max(0, newCasualLeave - casualLeaveCount)} */}
              {leaveCounts.Casual_Leave}
            </div>
          </div>
          <div className="casual-leave w-full flex items-center gap-3 bg-[#E2E9F3] p-4 rounded-lg">
            <div className="img-container bg-[#BFCFD7] w-fit rounded-full p-2">
              <img src={leaves} className="w-6" />
            </div>
            <div>
              <h1 className="text-sm">LOP</h1>
              <p>{leaveCounts.LOP}</p>
            </div>
          </div>

          {/* <div className="Vacation-leave w-full flex items-center gap-3 bg-[#E8F6FD] p-4 rounded-lg">
            <div className="img-container bg-[#2986CE] w-fit rounded-full p-2">
              <img src={vacationLeave} className="w-6" />
            </div>
            <div>
              <h1 className="text-sm">Vacation Leave Available</h1>
              {Math.max(0, leaveCounts.)}
            </div>
          </div> */}
        </div>

        <div className="search-container mt-4 lg:flex items-center justify-between">
          <div className="flex gap-3 items-center md:w-[70%] lg:w-[85%]">
            <div className="search-box w-[50%] gray-border rounded-lg flex gap-2 items-center p-2">
              <img src={search} className="w-5" />
              <input
                type="text"
                className="text-sm w-[100%] outline-none"
                placeholder="Search Leave..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-container text-gray-800 w-[50%]">
              <select
                className="gray-border outline-none max-sm:w-[100%] lg:w-[160px] xl:w-[200px] p-2 rounded-lg"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
          <button
            onClick={() => {
              handleModal();
              handleTint();
            }}
            className="button cursor-pointer bg-[#2986CE] max-sm:w-[100%] max-sm:mt-2 sm:mt-3 md:lg-0 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2"
          >
            <span className="flex items-center gap-2 m-auto">
              <img src={plus} className="w-4" />
              Apply Leave
            </span>
          </button>
        </div>
        <LeaveListTable
          leaves={filteredLeaves} // Pass filtered leaves as a prop
          filterStatus={filterStatus}
          setShowTint={setShowTint}
          handleDeleteLeave={handleDeleteLeave}
        />
      </div>
      {showLeaveApplyModal ? (
        <div className="leave-apply-modal  font-lato  text-[#222222] fixed top-[2%] sm:top-[1%] left-[50%] translate-x-[-50%] bg-white shadow-lg rounded-lg border sm:w-[95%]  md:w-[80%] h-[96vh] max-sm:w-[95%] max-sm:h-[95%]">
          <div className="header flex items-center justify-between p-3 border-bottom">
            <h1 className="text-[20px] text-[#222222]">Apply Leave</h1>
            <div
              onClick={() => {
                handleCloseModal();
                handleCloseTint();
              }}
              className="close-icon bg-[#D9D9D9] px-[10px] py-[10px] rounded-full w-fit cursor-pointer"
            >
              <img src={closeIcon} alt="" />
            </div>
          </div>
          <div className="form max-sm:mt-0  px-2 sm:p-6  ">
            <div className="form-header grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="from-date">
                <label htmlFor="fromDate" className="text-md ">
                  From
                </label>{" "}
                <br />
                <input
                  type="date"
                  className="rounded-lg mt-1 outline-none border w-full border-gray-800 py-2 sm:py-2 px-4 text-md"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleFormDataChange}
                />
              </div>
              <div className="to-date">
                <label htmlFor="toDate" className=" text-md  ">
                  To
                </label>{" "}
                <br />
                <input
                  type="date"
                  className="rounded-lg mt-1 w-full outline-none border border-gray-800 py-2 sm:py-2 px-4 text-md "
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleFormDataChange}
                />
              </div>
              {dateErrorMessage ? (
                <div className="text-red-500">
                  To date should not be earlier than From Date
                </div>
              ) : (
                ""
              )}
            </div>
            <div className="form-body-content mt-2 sm:space-y-2">
              <label htmlFor="leaveType" className="text-md">
                Select Leave Type
              </label>{" "}
              <br />
              <select
                name="leaveType"
                id="leaveType"
                className="mt-1 border outline-none  w-[100%] bg-transparent sm:py-2 py-2 px-2 sm:px-4 text-md  rounded-lg border-gray-800"
                value={formData.leaveType}
                onChange={handleFormDataChange}
              >
                <option value="">Select Leave Type</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Annual Leave">Annual Leave</option>
              </select>
              <div className="time-period flex items-center gap-3 bg-gray-50 px-2 py-2 w-[300px] rounded-lg">
                <div className="full-time w-[50%]">
                  <button
                    onClick={() => setSelectedTime("fullDay")}
                    className={`w-[100%] px-3 py-1 rounded-lg ${
                      selectedTime === "fullDay"
                        ? "bg-white shadow-sm text-black"
                        : "text-gray-400 bg-gray-100"
                    }`}
                  >
                    Full Day
                  </button>
                </div>
                <div className="custom w-[50%]">
                  <select
                    value={formData.timePeriod}
                    onChange={handleFormDataChange}
                    name="timePeriod"
                    className={`w-full px-3 py-1 rounded-lg outline-none ${
                      formData.timePeriod === "firstHalf" ||
                      formData.timePeriod === "secondHalf"
                        ? "bg-white shadow-sm text-black"
                        : "text-gray-500"
                    }`}
                  >
                    <option value="custom">Custom</option>
                    <option value="firstHalf">First Half</option>
                    <option value="secondHalf">Second Half</option>
                  </select>
                </div>
              </div>
              <div className="notes-section mt-4">
                <label htmlFor="notes" className="text-md ">
                  Notes
                </label>{" "}
                <br />
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormDataChange}
                  className="w-[100%] outline-none border border-gray-800 rounded-lg px-2 sm:px-4 text-sm  py-2 sm:py-2 sm:mt-2"
                ></textarea>
              </div>
              <label htmlFor="notify" className="text-md ">
                Notify
              </label>{" "}
              <br />
              <select
                name="notify"
                id="notify"
                className="border border-black w-[100%] px-2 sm:px-4 py-2 sm:py-2 text-md  rounded-lg mt-1"
                value={formData.notify}
                onChange={handleFormDataChange}
              >
                <option value="">Select Reporting Manager</option>
                <option>SARFARAZ AHMED A</option>
                <option>Dr. H. Anandakumar</option>
              </select>
              <div className="button-parent-section  relative ">
                <div className="button-section w-fit absolute  right-0  flex items-center gap-4 mt-3">
                  <button
                    onClick={() => {
                      handleCloseModal();
                      handleCloseTint();
                    }}
                    className="border border-gray-400 rounded-lg px-4 py-2 text-md font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitLeave}
                    className="rounded-lg px-4 py-2 border border-[#2986CE] text-md text-white bg-[#2986CE] font-semibold"
                  >
                    Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {deleteTint ? (
        <div className="delete-tint fixed top-0 right-0 bottom-0 left-0"></div>
      ) : (
        ""
      )}
      {openDeleteConfrimation ? (
        <div className="delete-confirm-box fixed top-[20%] left-[50%] translate-x-[-50%] bg-white p-2 rounded-lg shadow-2xl border w-[80%] sm:w-[40%]">
          <div className="header border-bottom py-2 ">
            <p className="font-semibold text-lg">Delete Confirmation</p>
          </div>
          <div className="body-content p-4">
            <div className="delete-icon bg-[#D75378CC] w-fit rounded-full p-2 m-auto">
              <svg
                width="30"
                height="30"
                viewBox="0 0 30 30"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.75 26.25C8.0625 26.25 7.47417 26.0054 6.985 25.5163C6.49583 25.0271 6.25083 24.4383 6.25 23.75V7.5H5V5H11.25V3.75H18.75V5H25V7.5H23.75V23.75C23.75 24.4375 23.5054 25.0263 23.0163 25.5163C22.5271 26.0063 21.9383 26.2508 21.25 26.25H8.75ZM21.25 7.5H8.75V23.75H21.25V7.5ZM11.25 21.25H13.75V10H11.25V21.25ZM16.25 21.25H18.75V10H16.25V21.25Z"
                  fill="white"
                />
              </svg>
            </div>
            <h1 className="font-semibold text-xl w-fit m-auto mt-2 ">
              Are you sure ?
            </h1>
            <p className="font-semibold text-lg mt-4 w-fit m-auto">
              Are you surely want to delete this item ?
            </p>
            <div className="button-section flex gap-2 items-center w-fit m-auto mt-5">
              <button
                onClick={handleDeleteModal}
                className="delete-btn bg-[#D75378] text-white font-semibold rounded-lg px-5 text-lg py-3"
              >
                Delete
              </button>
              <button
                onClick={handleCloseDeleteModal}
                className="cancel cancel-border text-black text-lg font-semibold rounded-lg px-5 py-3"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </>
  );
};

export default LeaveList;
