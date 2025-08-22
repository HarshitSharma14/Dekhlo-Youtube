import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../../store";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAppStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (!isLoggedIn) {
      toast.error("Please login to access this page");
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? children : null;
};

export default ProtectedRoute;
