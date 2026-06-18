import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

// Keys for localStorage (only session)
const USER_KEY = "vrot_current_user";

// Backend API base URL
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) setUser(JSON.parse(savedUser));
    setLoading(false);
  }, []);

  // -------------------- AUTH ENDPOINTS (server) --------------------
  const register = useCallback(
    async (name, email, phone, password, role = "citizen") => {
      try {
        const response = await axios.post(`${API_URL}/api/users/register`, {
          fullName: name,
          email,
          phone,
          password,
          role,
        });
        return { success: true, message: response.data.message, user: response.data.user };
      } catch (error) {
        console.error("Register error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Registration failed.",
        };
      }
    },
    []
  );

  const login = useCallback(
    async (email, password) => {
      try {
        const response = await axios.post(`${API_URL}/api/users/login`, {
          email,
          password,
        });
        if (response.data.success) {
          const userData = response.data.user;
          localStorage.setItem(USER_KEY, JSON.stringify(userData));
          setUser(userData);
          return { success: true, user: userData };
        } else {
          throw new Error("Login failed.");
        }
      } catch (error) {
        return {
          success: false,
          message: error.response?.data?.message || "Invalid email or password.",
        };
      }
    },
    []
  );

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  // -------------------- USER DATA FETCHING --------------------
  const fetchUserData = useCallback(async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/users/me?userId=${userId}`);
      const userData = response.data;
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      console.error("Fetch user data error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to fetch user data.",
      };
    }
  }, []);

  // -------------------- PROFILE UPDATE --------------------
  const updateProfile = useCallback(
    async (profileData) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.put(`${API_URL}/api/users/profile`, {
          userId: user.id,
          profile: profileData,
        });
        const updatedUser = response.data.user;
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } catch (error) {
        console.error("Profile update error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to update profile.",
        };
      }
    },
    [user]
  );

  // -------------------- APPLICATIONS (with file upload) --------------------
  const submitApplication = useCallback(
    async (type, data, files) => {
      if (!user) throw new Error("Not logged in.");

      const formData = new FormData();
      formData.append('userId', user.id);
      formData.append('type', type);
      formData.append('data', JSON.stringify(data));

      // Append files (if any)
      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append('documents', files[i]);
        }
      }

      try {
        const response = await axios.post(`${API_URL}/api/users/application`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        return { success: true, application: response.data.application };
      } catch (error) {
        console.error("Submit application error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to submit application.",
        };
      }
    },
    [user]
  );

  const getApplications = useCallback(
    async (admin = false) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.get(`${API_URL}/api/users/applications`, {
          params: { userId: user.id, admin: admin ? "true" : "false" },
        });
        return response.data;
      } catch (error) {
        console.error("Get applications error:", error);
        return [];
      }
    },
    [user]
  );

  const getApplicationById = useCallback(
    async (applicationId) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.get(`${API_URL}/api/users/application/${applicationId}`, {
          params: { userId: user.id },
        });
        return response.data;
      } catch (error) {
        console.error("Get application error:", error);
        return null;
      }
    },
    [user]
  );

  const updateApplicationStatus = useCallback(
    async (applicationId, status) => {
      if (!user || user.role !== "admin")
        throw new Error("Admin access required.");
      try {
        const response = await axios.patch(
          `${API_URL}/api/users/application/${applicationId}`,
          { status }
        );
        return { success: true, message: response.data.message };
      } catch (error) {
        console.error("Update application status error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to update status.",
        };
      }
    },
    [user]
  );

  // -------------------- PAYMENTS --------------------
  // NEW: record payment for a specific application
  const recordPayment = useCallback(
    async (applicationId, transactionId, amount) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.post(
          `${API_URL}/api/users/application/${applicationId}/payment`,
          { transactionId, amount }
        );
        return { success: true, message: response.data.message };
      } catch (error) {
        console.error("Record payment error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to record payment.",
        };
      }
    },
    [user]
  );

  // Generic payment recording (for other cases)
  const submitPayment = useCallback(
    async (amount, description, reference) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.post(`${API_URL}/api/users/payment`, {
          userId: user.id,
          amount,
          description,
          reference,
        });
        return { success: true, payment: response.data.payment };
      } catch (error) {
        console.error("Submit payment error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to record payment.",
        };
      }
    },
    [user]
  );

  const getPayments = useCallback(
    async (admin = false) => {
      if (!user) throw new Error("Not logged in.");
      try {
        const response = await axios.get(`${API_URL}/api/users/payments`, {
          params: { userId: user.id, admin: admin ? "true" : "false" },
        });
        return response.data;
      } catch (error) {
        console.error("Get payments error:", error);
        return [];
      }
    },
    [user]
  );

  // -------------------- ADMIN FUNCTIONS --------------------
  const getAllUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/api/users/users`);
      return response.data;
    } catch (error) {
      console.error("Get all users error:", error);
      return [];
    }
  }, []);

  const verifyUser = useCallback(async (userId) => {
    try {
      const response = await axios.patch(`${API_URL}/api/users/verify/${userId}`);
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify user error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to verify user.",
      };
    }
  }, []);

  // ---------- OTP FUNCTIONS ----------
  const requestPasswordResetOtp = useCallback(async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/request-otp`, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Request OTP Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP.",
      };
    }
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify OTP Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid OTP or OTP expired.",
      };
    }
  }, []);

  const resetPasswordWithOtp = useCallback(
    async (email, otp, newPassword) => {
      try {
        const response = await axios.post(`${API_URL}/api/users/reset-password`, {
          email,
          otp,
          newPassword,
        });
        return { success: true, message: response.data.message };
      } catch (error) {
        console.error("Reset password error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to reset password.",
        };
      }
    },
    []
  );

  const changePasswordWithOtp = useCallback(
    async (email, otp, currentPassword, newPassword) => {
      const verifyResult = await verifyOtp(email, otp);
      if (!verifyResult.success) return verifyResult;

      try {
        const response = await axios.post(`${API_URL}/api/users/change-password`, {
          email,
          currentPassword,
          newPassword,
        });
        if (user && user.email === email) {
          const updatedUser = { ...user, password: newPassword };
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
        return { success: true, message: response.data.message };
      } catch (error) {
        console.error("Change password error:", error);
        return {
          success: false,
          message: error.response?.data?.message || "Failed to change password.",
        };
      }
    },
    [user, verifyOtp]
  );

  const adminResetUserPassword = useCallback(async (email) => {
    return await requestPasswordResetOtp(email);
  }, [requestPasswordResetOtp]);

  // ---------- SIGNUP OTP FUNCTIONS ----------
  const sendSignupOtp = useCallback(async (email) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/send-signup-otp`, { email });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Send Signup OTP Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to send OTP.",
      };
    }
  }, []);

  const verifySignupOtp = useCallback(async (email, otp) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/verify-signup-otp`, { email, otp });
      return { success: true, message: response.data.message };
    } catch (error) {
      console.error("Verify Signup OTP Error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Invalid OTP.",
      };
    }
  }, []);

  // ---------- CONTEXT VALUE ----------
  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      role: user?.role || null,
      login,
      logout,
      register,
      getAllUsers,
      verifyUser,
      fetchUserData,
      updateProfile,
      submitApplication,
      getApplications,
      getApplicationById,
      updateApplicationStatus,
      recordPayment,   // <-- added
      submitPayment,
      getPayments,
      requestPasswordResetOtp,
      verifyOtp,
      resetPasswordWithOtp,
      changePasswordWithOtp,
      adminResetUserPassword,
      sendSignupOtp,
      verifySignupOtp,
      hasRole: (roles = []) => !!user && roles.includes(user.role),
    }),
    [
      user,
      loading,
      login,
      logout,
      register,
      getAllUsers,
      verifyUser,
      fetchUserData,
      updateProfile,
      submitApplication,
      getApplications,
      getApplicationById,
      updateApplicationStatus,
      recordPayment,
      submitPayment,
      getPayments,
      requestPasswordResetOtp,
      verifyOtp,
      resetPasswordWithOtp,
      changePasswordWithOtp,
      adminResetUserPassword,
      sendSignupOtp,
      verifySignupOtp,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
};

export default AuthContext;