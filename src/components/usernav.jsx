import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/userSlice";
import { Menu, X, ChevronDown } from "lucide-react";
import { fetchUser } from "../utils/fetchUser";

export default function Nav() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const user = useSelector((state) => state.user.user);
  const token = useSelector((state) => state.user.token);

  const handleLogout = () => {
    dispatch(logout());
    localStorage.removeItem("album_jwt_token");
    localStorage.removeItem("last_visited_route");
    alert("Logged out successfully.");
    navigate("/login");
  };

  // ✅ Handles Hidden Album creation or navigation
  const handleHiddenAlbumClick = async () => {
    const hasHidden = user?.groups?.some(
      (g) => g.groupName?.toLowerCase() === "hidden"
    );

    if (hasHidden) {
      navigate("/dashboard/hidden", { state: { openHidden: true } });
      setSettingsOpen(false);
      setMobileOpen(false);
      return;
    }

    const confirmCreate = window.confirm(
      "You don't have a Hidden Album yet.\nWould you like to create one now?"
    );
    if (!confirmCreate) return;
    if (!user) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/makegroup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          albumType: "Hidden",
          albumName: "Hidden",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create album");

      alert("Hidden Album created successfully!");
      await fetchUser();
      navigate("/dashboard/hidden", { state: { openHidden: true } });
    } catch (err) {
      console.error("Error creating hidden album:", err);
      alert("Could not create Hidden Album. Please try again.");
    } finally {
      setSettingsOpen(false);
      setMobileOpen(false);
    }
  };

  const menuItem =
    "text-[#4b2e1a] font-medium hover:text-[#a0522d] transition-colors";

  return (
    <nav className="w-full sticky top-0 left-0 z-50 bg-[#fffdfb]/90 backdrop-blur-md border-b border-[#eadfd5] shadow-sm">
      <div className="mx-auto px-5 py-3 flex justify-between items-center">
        {/* 🌿 Brand */}
        <span
          onClick={() => navigate("/")}
          className="font-bold text-xl sm:text-2xl tracking-wide cursor-pointer"
          style={{ color: "#a0522d", letterSpacing: "1.2px" }}
        >
          Albumify
        </span>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <button onClick={() => navigate("/dashboard")} className={menuItem}>
            Dashboard
          </button>
          <button onClick={() => navigate("/request")} className={menuItem}>
            Requests
          </button>
          <button onClick={() => navigate("/upload")} className={menuItem}>
            Upload
          </button>

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen((prev) => !prev)}
              className={`${menuItem} flex items-center gap-1`}
            >
              Settings <ChevronDown size={16} />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-[#eadfd5] rounded-xl shadow-lg z-50 overflow-hidden">
                {[
                  { label: "Your Profile", path: "/profile" },
                  { label: "Your Friends", path: "/friends" },
                  { label: "Rewards & Referrals", path: "/rewards" },
                  { label: "Hidden Album", path: "/dashboard/hidden" },
                ].map((item) => (
                  <div
                    key={item.label}
                    onClick={() => {
                      if (item.path === "/dashboard/hidden") {
                        handleHiddenAlbumClick();
                      } else {
                        navigate(item.path);
                      }
                      setSettingsOpen(false);
                    }}
                    className="px-4 py-2 text-sm text-[#4b2e1a] hover:bg-[#f9f3ef] cursor-pointer"
                  >
                    {item.label}
                  </div>
                ))}
                <hr className="border-[#f0e6dc]" />
                <div
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  Logout
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="text-[#a0522d] hover:text-[#7a5a3c] transition"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#eadfd5] px-5 py-3 space-y-2 shadow-sm">
                    <button
            onClick={() => {
              navigate("/dashboard");
              setMobileOpen(false);
            }}
            className="block w-full text-left text-[#4b2e1a] hover:text-[#a0522d] py-2"
          >
            Dashboard
          </button>
                    <button
            onClick={() => {
              navigate("/upload");
              setMobileOpen(false);
            }}
            className="block w-full text-left text-[#4b2e1a] hover:text-[#a0522d] py-2"
          >
            Uploads
          </button>
          <button
            onClick={() => {
              navigate("/request");
              setMobileOpen(false);
            }}
            className="block w-full text-left text-[#4b2e1a] hover:text-[#a0522d] py-2"
          >
            Requests
          </button>

          {[
            { label: "Your Profile", path: "/profile" },
            { label: "Your Friends", path: "/friends" },
            { label: "Hidden Album", path: "/dashboard/hidden" },
            { label: "Rewards & Referrals", path: "/rewards" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                if (item.path === "/dashboard/hidden") {
                  handleHiddenAlbumClick();
                } else {
                  navigate(item.path);
                }
                setMobileOpen(false);
              }}
              className="block w-full text-left text-[#4b2e1a] hover:text-[#a0522d] py-2"
            >
              {item.label}
            </button>
          ))}

          <button
            onClick={() => {
              handleLogout();
              setMobileOpen(false);
            }}
            className="block w-full text-left text-red-600 hover:text-red-700 py-2"
          >
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
