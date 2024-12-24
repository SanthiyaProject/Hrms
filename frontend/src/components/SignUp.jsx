import React, { useContext, useState } from "react";
import signUpBg from "../assets/Singup-bg.svg";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import axios from "axios";
function SignUp() {
  const [showPassword, setshowPassword] = useState(false);
  const [confirmPasswordShow, setconfirmPasswordShow] = useState(false);
  const [alert, setalert] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const validateName = (name) => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters long";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!email.toLowerCase().endsWith("@sece.ac.in")) {
      return "Email must be a valid sece.ac.in domain email";
    }
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (!/(?=.*[a-z])/.test(password))
      return "Password must contain a lowercase letter";
    if (!/(?=.*[A-Z])/.test(password))
      return "Password must contain an uppercase letter";
    if (!/(?=.*\d)/.test(password)) return "Password must contain a number";
    if (!/(?=.[@$!%?&])/.test(password))
      return "Password must contain a special character";
    if (password.length < 8)
      return "Password must be at least 8 characters long";
    return "";
  };

  const validateConfirmPassword = (confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (confirmPassword !== formData.password) return "Passwords do not match";
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (touched[name]) {
      let error = "";
      switch (name) {
        case "name":
          error = validateName(value);
          break;
        case "email":
          error = validateEmail(value);
          break;
        case "password":
          error = validatePassword(value);
          if (formData.confirmPassword) {
            setErrors((prev) => ({
              ...prev,
              confirmPassword:
                value !== formData.confirmPassword
                  ? "Passwords do not match"
                  : "",
            }));
          }
          break;
        case "confirmPassword":
          error = validateConfirmPassword(value);
          break;
        default:
          break;
      }
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    let error = "";
    switch (name) {
      case "name":
        error = validateName(formData.name);
        break;
      case "email":
        error = validateEmail(formData.email);
        break;
      case "password":
        error = validatePassword(formData.password);
        break;
      case "confirmPassword":
        error = validateConfirmPassword(formData.confirmPassword);
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
      confirmPassword: validateConfirmPassword(formData.confirmPassword),
    };

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });

    if (Object.values(newErrors).some((error) => error)) {
      setalert(true);
      setTimeout(() => {
        setalert(false);
      }, 1000);
      return;
    }

    try {
      const requestData = {
        username: formData.name, // Map name to username
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await axios.post(
        "http://127.0.0.1:8000/api/register/",
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("requestData :", requestData);
      // Log the response data
      console.log("Form submitted successfully!", response.data);
      navigate("/");

      // Optionally, you can reset the form or show a success message
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(
        "Error submitting the form",
        error.response?.data || error.message
      );
      // Handle error response, e.g., show an error alert
      setalert(true);
      setTimeout(() => {
        setalert(false);
      }, 1000);
    }
  };

  return (
    // <div className="min-h-screen border border-black flex items-center justify-center bg-gray-100">
    <div className="grid grid-cols-1 md:grid-cols-2 bg-white w-full h-[400px]">
      {/* Left Section: Form */}
      <div className="px-12 py-8 ">
        <div className="mb-6">
          <img src={logo} alt="Logo" className="h-14" />
        </div>
        <h2 className="text-2xl font-semibold mb-6">Create a New Account</h2>
        <form onSubmit={handleSubmit}>
          {/* Name Field */}
          <div className="mb-4">
            <label className="block text-black text-lg font-semibold">
              Name
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-3 py-2 border ${
                errors.name && touched.name
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md`}
              placeholder="Enter your name"
            />
            {errors.name && touched.name && (
              <p className="text-red-500 text-sm">{errors.name}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="mb-4">
            <label className="block text-black text-lg font-semibold">
              E-mail Id
            </label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-[100%] px-3 py-2 border ${
                errors.email && touched.email
                  ? "border-red-500"
                  : "border-gray-300"
              } rounded-md`}
              placeholder="Enter your email Id"
            />
            {errors.email && touched.email && (
              <p className="text-red-500 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label className="block text-black text-lg font-semibold">
              Password
            </label>
            <div className="input-section   relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-[100%] px-3 py-2 border ${
                  errors.password && touched.password
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md`}
                placeholder="Enter your password"
              />
              <div
                onClick={() => setshowPassword(!showPassword)}
                className="absolute right-4 top-2"
              >
                {showPassword ? (
                  <Eye className="text-gray-400" />
                ) : (
                  <EyeOff className="text-gray-400" />
                )}
              </div>
            </div>

            {errors.password && touched.password && (
              <p className="text-red-500 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="mb-4">
            <label className="block text-black text-lg font-semibold">
              Confirm Password
            </label>
            <div className="input-section relative">
              <input
                type={confirmPasswordShow ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full px-3 py-2 border ${
                  errors.confirmPassword && touched.confirmPassword
                    ? "border-red-500"
                    : "border-gray-300"
                } rounded-md`}
                placeholder="Re-enter your password"
              />
              <div
                onClick={() => setconfirmPasswordShow(!confirmPasswordShow)}
                className="absolute right-4 top-2"
              >
                {confirmPasswordShow ? (
                  <Eye className="text-gray-400 " />
                ) : (
                  <EyeOff className="text-gray-400" />
                )}
              </div>
            </div>
            {errors.confirmPassword && touched.confirmPassword && (
              <p className="text-red-500 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-semibold"
          >
            Sign Up
          </button>

          <p className="mt-4 text-center text-gray-600">
            Already have an account?{" "}
            <Link to="/" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </form>
      </div>

      {/* Right Section: Image */}
      <div className="bg-blue-500   hidden md:flex items-center justify-center ">
        <img
          src={signUpBg}
          alt="Sign Up Illustration"
          className="h-auto w-3/4"
        />
      </div>
      {alert ? (
        <div className="alert fixed top-3 left-0 bg-red-400 text-white font-semibold px-4 py-2 rounded-tr-lg rounded-br-lg  transition-all duration-300">
          <p>User already exists!</p>
        </div>
      ) : (
        " "
      )}
    </div>
    // </div>
  );
}

export default SignUp;
