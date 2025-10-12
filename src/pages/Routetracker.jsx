// RouteTracker.jsx
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function RouteTracker() {
  const location = useLocation();
  
  useEffect(() => {
    localStorage.setItem("last_visited_route", location.pathname);
  }, [location]);

  return null;
}
