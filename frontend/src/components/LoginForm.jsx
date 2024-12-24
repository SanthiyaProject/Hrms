import React, { useContext, useEffect, useState } from "react";
import { CodeSquare, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import logo from "../assets/logo.png";
import loginBg from "../assets/bg.svg";
import axios from "axios";
import { Data } from "../context/store";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
function LoginForm() {
  const navigate = useNavigate();
  const { globalUserName, setGlobalUserName, newName, setNewName } =
    useContext(Data);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loader, setLoader] = useState(false);
  const [userHasToApproved, setUserHastoApproved] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill out both fields");
      return;
    }

    setGlobalUserName(email);
    setLoader(true);

    try {
      const response = await axios.post("http://localhost:8000/api/login/", {
        email, // Assuming "username" corresponds to email
        password,
      });

      const token = response.data.token;
      console.log("Token received:", token);
      localStorage.setItem("jwtToken", token); // Save the token locally
      const decoded = jwtDecode(token);
      const user_id = decoded.user_id;

      if (token) {
        if (email === "hr_user@sece.ac.in") {
          navigate("/Admindashboard");
        } else {
          navigate("/Dashboard");
        }
        window.location.reload(); // Refresh the page to update the UI
      } else {
        alert("Password incorrect");
      }
    } catch (error) {
      setLoader(false); // Hide loader if there's an error

      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          alert("Admin has to approve");
        } else if (status === 401) {
          alert("Check your login credentials");
        } else {
          console.error("Unexpected error:", error.response.data);
          alert("An unexpected error occurred. Please try again.");
        }
      } else {
        console.error("Error during login:", error);
        alert("Failed to connect to the server. Please check your connection.");
      }
    }
  };

  function handleForgotPasswordNavigation() {
    navigate("/forgotPassword");
  }
  return (
    <div className=" lato  flex  justify-center ">
      {userHasToApproved ? (
        <div className="text-white absolute top-[20%] px-3 py-2 font-semibold left-4 bg-blue-400 w-fit rounded-lg">
          Admin has to approve!
        </div>
      ) : (
        ""
      )}
      <div className="w-full  grid grid-cols-1 md:grid-cols-2 items-center bg-white  ">
        {/* Left Side - Form */}
        <div className="p-8 h-fit ">
          <div className="mb-8 logo">
            <img src={logo} className="w-[140px]" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2 mt-2">
              Login to your account
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-lg font-semibold text-gray-700"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block outline-none w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-lg font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block outline-none w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end ">
              <p
                onClick={handleForgotPasswordNavigation}
                className="text-md cursor-pointer font-semibold text-[#2986CE] hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2986CE] text-white py-2.5 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 transition-all font-semibold text-lg"
            >
              Login
            </button>

            <p className="text-center text-md text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => {
                  navigate("/signUp");
                }}
                className="text-[#2986CE] hover:text-blue-800 hover:underline font-semibold"
              >
                Sign Up
              </button>
            </p>
          </form>
        </div>

        {/* Right Side - Illustration */}
        <div className="hidden md:block h-[119.3%]  bg-[#2986CE]     ">
          <div className="h-full flex items-center justify-center">
            <img
              src={loginBg}
              alt="Login illustration"
              className="w-[70%] h-[80%] "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
