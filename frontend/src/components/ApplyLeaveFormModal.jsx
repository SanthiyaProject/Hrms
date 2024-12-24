import React, { useContext, useState, useEffect } from "react";
import { Data } from "../context/store";
import closeIcon from "../assets/close-icon.svg";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
const ApplyLeaveFormModal = ({ handleCloseModal }) => {
  const { QuickActionModal, userName, setEmployeeLeaveDetails } =
    useContext(Data);
  console.log("userName from provider : ", userName);
  // const [department, setDepartment] = useState("")
  // let dept = "EEE";
  const [selectedTime, setSelectedTime] = useState("fullDay");
  const [formData, setFormData] = useState({
    fromDate: "",
    toDate: "",
    leaveType: "",
    timePeriod: selectedTime,
    notes: "",
    notify: "",
  });

  const [existingLeaves, setExistingLeaves] = useState([]);

  // Fetch existing leaves when the modal mounts
  useEffect(() => {
    const fetchExistingLeaves = async () => {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;
  
      try {
        const response = await axios.get(`http://127.0.0.1:8000/api/leave/user/${user_id}/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setExistingLeaves(response.data); // Assuming response.data contains an array of leave records
      } catch (error) {
        console.error("Error fetching existing leaves:", error);
      }
    };
  
    fetchExistingLeaves();
  }, []);

  const checkForConflicts = (fromDate, toDate) => {
    return existingLeaves.some(leave => {
      const leaveFromDate = new Date(leave.fromDate);
      const leaveToDate = new Date(leave.toDate);
      return (
        (leaveFromDate <= new Date(toDate) && leaveToDate >= new Date(fromDate)) // Overlap condition
      );
    });
  };
  

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Define loading state
  // const [selectedTime, setSelectedTime] = useState('fullDay');

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fromDate) {
      newErrors.fromDate = "From date is required.";
    }

    if (!formData.toDate) {
      newErrors.toDate = "To date is required.";
    } else if (new Date(formData.toDate) < new Date(formData.fromDate)) {
      newErrors.toDate = "To date should not be earlier than From Date.";
    }

    if (!formData.leaveType) {
      newErrors.leaveType = "Leave type is required.";
    }

    if (selectedTime === "custom" && !formData.timePeriod) {
      newErrors.timePeriod = "Please select a time period.";
    }

    if (!formData.notify) {
      newErrors.notify = "Please select a reporting manager.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  function handleCloseTint() {
    // setShowTint(false);
  }
  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  const handleSubmitLeave = async () => {
    if (!validateForm()) {
      return; // Stop execution if validation fails
    }

      // Check for date conflicts
  if (checkForConflicts(formData.fromDate, formData.toDate)) {
    alert("You have already applied for leave on these dates. Please select different dates.");
    return;
  }


    try {
      const token = localStorage.getItem("jwtToken");
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;
      console.log("User id:", user_id);

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

      // Prepare the request data for the POST call
      const requestData = {
        leave_type: formData.leaveType,
        fromDate: formData.fromDate,
        user_id: user_id,
        employee_id: user_id,
        toDate: formData.toDate,
        notes: formData.notes,
        notify: formData.notify,
        time_period: formData.timePeriod,
        user_name: userName,
        user_department: dept, // Pass the department here
      };

      // Submit the leave request
      const postResponse = await axios.post(
        "http://127.0.0.1:8000/api/leave/submit/",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const newLeave = postResponse.data; // Assume the server responds with the saved leave data
      console.log("Leave applied successfully:", newLeave);

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
      handleCloseTint();
      handleCloseModal();
    } catch (error) {
      console.error("Error applying leave:", error);
      alert("There was an issue applying the leave. Please try again.");
    }
  };

  return (
    <>
      <div className="leave-apply-modal font-lato z-[100] text-[#222222] fixed top-[2%] sm:top-[1%] left-[50%] translate-x-[-50%] bg-white shadow-lg rounded-lg border sm:w-[95%] md:w-[80%] h-[96vh] max-sm:w-[95%] max-sm:h-[95%]">
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
        <div className="form max-sm:mt-0 px-2 sm:p-6">
          <div className="form-header grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="from-date">
              <label htmlFor="fromDate" className="text-md">
                From
              </label>
              <br />
              <input
                type="date"
                className={`rounded-lg mt-1 outline-none border w-full border-gray-800 py-2 sm:py-2 px-4 text-md ${
                  errors.fromDate ? "border-red-500" : ""
                }`}
                name="fromDate"
                value={formData.fromDate}
                onChange={handleFormDataChange}
              />
              {errors.fromDate && (
                <div className="text-red-500">{errors.fromDate}</div>
              )}
            </div>

            <div className="to-date">
              <label htmlFor="toDate" className="text-md">
                To
              </label>
              <br />
              <input
                type="date"
                className={`rounded-lg mt-1 w-full outline-none border border-gray-800 py-2 sm:py-2 px-4 text-md ${
                  errors.toDate ? "border-red-500" : ""
                }`}
                name="toDate"
                value={formData.toDate}
                onChange={handleFormDataChange}
              />
              {errors.toDate && (
                <div className="text-red-500">{errors.toDate}</div>
              )}
            </div>
          </div>
          <div className="form-body-content mt-2 sm:space-y-2">
            <label htmlFor="leaveType" className="text-md">
              Select Leave Type
            </label>
            <br />
            <select
              name="leaveType"
              id="leaveType"
              className={`mt-1 border outline-none w-full bg-transparent sm:py-2 py-2 px-2 sm:px-4 text-md rounded-lg border-gray-800 ${
                errors.leaveType ? "border-red-500" : ""
              }`}
              value={formData.leaveType}
              onChange={handleFormDataChange}
            >
              <option value="">Select Leave Type</option>
              <option value="Sick Leave">Sick Leave</option>
              <option value="Casual Leave">Casual Leave</option>
              <option value="Annual Leave">Annual Leave</option>
            </select>
            {errors.leaveType && (
              <div className="text-red-500">{errors.leaveType}</div>
            )}

            <div className="time-period flex items-center gap-3 bg-gray-50 px-2 py-2 w-[300px] rounded-lg">
              <div className="full-time w-[50%]">
                <button
                  onClick={() => setSelectedTime("fullDay")}
                  className={`w-full px-3 py-1 rounded-lg ${
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
                  <option value="">Custom</option>
                  <option value="firstHalf">First Half</option>
                  <option value="secondHalf">Second Half</option>
                </select>
                {errors.timePeriod && (
                  <div className="text-red-500">{errors.timePeriod}</div>
                )}
              </div>
            </div>

            <div className="notes-section mt-4">
              <label htmlFor="notes" className="text-md">
                Notes
              </label>
              <br />
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormDataChange}
                className={`w-full outline-none border border-gray-800 rounded-lg px-2 sm:px-4 text-sm py-2 sm:py-2 sm:mt-2 ${
                  errors.notes ? "border-red-500" : ""
                }`}
              ></textarea>
            </div>

            <label htmlFor="notify" className="text-md">
              Notify
            </label>
            <br />
            <select
              name="notify"
              id="notify"
              className={`border border-black w-full px-2 sm:px-4 py-2 sm:py-2 text-md rounded-lg mt-1 ${
                errors.notify ? "border-red-500" : ""
              }`}
              value={formData.notify}
              onChange={handleFormDataChange}
            >
              <option value="">Select Reporting Manager</option>
              {/* Add more options as needed */}
              <option>SARFARAZ AHMED A</option>
              <option>Dr. H. Anandakumar</option>
            </select>
            {errors.notify && (
              <div className="text-red-500">{errors.notify}</div>
            )}

            {/* Button section */}
            <div className="button-parent-section relative ">
              <div className="button-section w-fit absolute right-0 flex items-center gap-4 mt-3">
                {/* Cancel Button */}
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleCloseTint();
                  }}
                  disabled={loading} // Disable button while loading
                  className={`border border-gray-400 rounded-lg px-4 py-2 text-md font-semibold ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  Cancel
                </button>

                {/* Submit Button */}
                <button
                  onClick={handleSubmitLeave}
                  disabled={loading} // Disable button while loading
                  className={`rounded-lg px-4 py-2 border border-[#2986CE] text-md text-white bg-[#2986CE] font-semibold ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Submitting..." : "Request"}
                </button>
              </div>
            </div>
          </div>{" "}
          {/* End of form-body-content */}
        </div>{" "}
        {/* End of form */}
      </div>{" "}
      {/* End of modal */}
    </>
  );
};

export default ApplyLeaveFormModal;
