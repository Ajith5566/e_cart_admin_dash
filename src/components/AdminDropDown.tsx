import { faGear, faRightFromBracket, faUser } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

type AdminDropdownProps = {
  dropdownOpen: boolean;
  logout: () => void;
};
function AdminDropDown({ dropdownOpen, logout }:AdminDropdownProps) {
  const navigate = useNavigate();

  return (
    <>
        <div
      id="dropedit"
      className={`dropdown-menu shadow p-0 ${dropdownOpen ? "show" : ""}`}
    >

      {/* Header */}
      <div className="px-3 py-3 border-bottom bg-light rounded-top">
        <div className="fw-semibold">Super Admin</div>
        <small className="text-muted">super-admin</small>
      </div>

      {/* Menu Items */}
      <div className="d-flex flex-column">

        <button className="dropdown-item py-2">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          Profile
        </button>

        <div className="dropdown-item py-2">
          <FontAwesomeIcon icon={faGear} className="me-2" />
          <button  onClick={() => navigate("/admin-dash/settings")} style={{"border":"none",'background':'transparent'}}>Settings</button >
        </div>

      </div>

      {/* Logout */}
      <div className="border-top mt-2 ">

        <button
          className="dropdown-item text-danger py-2 d-flex justify-content-center align-items-center mt-2"
          onClick={logout}
        >
            <FontAwesomeIcon icon={faRightFromBracket} className="me-2" />
          Signout
        </button>

      </div>

    </div>
    </>
  )
}

export default AdminDropDown