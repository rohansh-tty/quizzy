import React, { useState } from "react";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Message } from "primereact/message";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { GOOGLE_CLIENT_ID } from "../config/googleAuth";
import { updateEventDetails } from "../apis/event";
import { createUser, getUser } from "../apis/user";
import {toast} from 'react-hot-toast'

const Auth: React.FC = () => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userObject, setUserObject] = useState<any | null>(null);

  console.log("Auth component rendered", { isSignup, isLoading, error });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log("Input change", { name, value, currentFormData: formData });
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(""); // Clear error when user starts typing
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submit triggered", { isSignup, formData });
    setError("");
    setIsLoading(true);

    try {
      if (isSignup) {
        console.log("Processing signup form");
        // Validate signup form
        if (!formData.username || !formData.email || !formData.password) {
          console.log("Validation failed: missing required fields", formData);
          setError("All fields are required");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          console.log("Validation failed: passwords don't match");
          setError("Passwords do not match");
          return;
        }
        if (formData.password.length < 6) {
          console.log("Validation failed: password too short", formData.password.length);
          setError("Password must be at least 6 characters long");
          return;
        }

        console.log("Validation passed, calling signup API");
        await signup({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });
        console.log("Signup API call completed successfully");
      } else {
        console.log("Login form submitted - showing error message");
        // Handle login (for now, just show error since we don't have login endpoint)
        setError(
          "Email/password login not implemented yet. Please use Google sign-in."
        );
        return;
      }
    } catch (err: any) {
      console.error("Form submission error", err);
      setError(err.message || "An error occurred");
    } finally {
      console.log("Form submission completed, setting loading to false");
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (
    credentialResponse: CredentialResponse
  ) => {
    console.log("Google OAuth success triggered", { 
      hasCredential: !!credentialResponse.credential,
      isSignup 
    });
    
    if (credentialResponse.credential) {
      // Decode the JWT token to get user information
      try {
        console.log("Decoding Google JWT token");
        const base64Url = credentialResponse.credential.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );

        const userData = JSON.parse(jsonPayload);
        console.log("Decoded user data from Google", userData);

        const user = {
          id: userData.sub,
          name: userData.name,
          email: userData.email,
          picture: userData.picture,
          username: userData.name,
        };

        console.log("Processed user object", user);
        console.log("Calling login function");


        
        // TODO: check if user exists in backend, if user is not found, redirect user to signup page
        if (isSignup) {
          console.log("Signup flow: creating user in backend");
          const response = await createUser(user);
          console.log("Create user response", response, response.status);
          
          if (response.status === 200 || response.status === 201) {
            console.log("User created successfully, updating event details");
            // await updateEventDetails({
            //   user_id: response.data.id, // this is user uuid from backend
            //   user_email: user.email,
            //   event_details: "user-signup",
            //   status: "success",
            //   created_at: new Date().toISOString(),
            // });
            localStorage.setItem('user', JSON.stringify(response.data));
            setUserObject(user);
            console.log("Event details updated for signup success, navigating to home");
            navigate("/");
          } else {
            console.log("User creation failed, updating event details with error");
            await updateEventDetails({
              user_id: response.data.id, // this is user uuid from backend
              user_email: user.email,
              event_details: "user-signup",
              status: "error",
              created_at: new Date().toISOString(),
            });
            console.log("Setting isSignup to true due to creation failure");
            // navigate("/signup");
            setIsSignup(true);
            return;
          }
        } else {
          console.log("Login flow: checking if user exists in backend");
          login(user); // LOGGING USER HERE....
          // update event details in backend
          // check if user exists in backend, if user is not found, redirect user to signup page
          console.log("Getting user from backend", user);
          const userResponse = await getUser(user.email);
          if ('error' in userResponse) {
            toast.error(userResponse.data.error as string);
            return;
          }
                    console.log('User lookup response:', userResponse, userResponse);

          if (userResponse.status !== 200) {
            console.log("User not found, switching to signup mode");
            // navigate("/");
            setIsSignup(true);
            return;
          }
          localStorage.setItem('user', JSON.stringify(userResponse.data));
          setUserObject(user);
          console.log("User found, updating event details for signin");
          navigate("/");
        }
      } catch (error: any) {
        // console.error("Error decoding Google credential:", error,);
        toast.error(error.response.data.error as string,  {
          duration: 4000,
          position: 'top-center',
        });
        return;
      }
    }
  };

  const handleGoogleError = () => {
    console.error("Google login failed");
  };

  const handleToggleMode = (newMode: boolean) => {
    console.log("Toggling auth mode", { from: isSignup, to: newMode });
    setIsSignup(newMode);
  };

  console.log("Rendering Auth component", { 
    isSignup, 
    isLoading, 
    hasError: !!error,
    formDataKeys: Object.keys(formData).filter(key => formData[key as keyof typeof formData])
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">Quizzy</h1>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {isSignup ? "Create your account" : "Welcome to Quizzy"}
          </h2>
          <p className="text-gray-600 mb-8">
            {isSignup
              ? "Sign up to create and manage your quizzes"
              : "Sign in to create and manage your quizzes"}
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-6">
            {/* Toggle between login and signup */}
            <div className="flex justify-center space-x-4 gap-4">
              <Button
                label="Sign In"
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !isSignup
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleToggleMode(false)}
              />
              <Button
                label="Sign Up"
                className={`px-6 py-2 rounded-lg transition-colors ${
                  isSignup
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                onClick={() => handleToggleMode(true)}
              />
            </div>

            {/* Error message */}
            {error && (
              <Message severity="error" text={error} className="w-full" />
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignup && (
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Username
                  </label>
                  <InputText
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Enter your username"
                    required={isSignup}
                  />
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <InputText
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <Password
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full"
                  placeholder="Enter your password"
                  required
                  toggleMask
                  feedback={false}
                />
              </div>

              {isSignup && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <Password
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full"
                    placeholder="Confirm your password"
                    required={isSignup}
                    toggleMask
                    feedback={false}
                  />
                </div>
              )}

              <Button
                type="submit"
                label={isSignup ? "Sign Up" : "Sign In"}
                className="w-full bg-blue-600 hover:bg-blue-700"
                loading={isLoading}
                disabled={isLoading}
              />
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google OAuth */}
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {isSignup ? "Sign up with Google" : "Sign in with Google"}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Use your Google account to get started
              </p>
            </div>

            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <div className="flex justify-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={true}
                  theme="outline"
                  size="large"
                  text={isSignup ? "signup_with" : "signin_with"}
                  shape="rectangular"
                />
              </div>
            </GoogleOAuthProvider>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                By {isSignup ? "signing up" : "signing in"}, you agree to our
                Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
