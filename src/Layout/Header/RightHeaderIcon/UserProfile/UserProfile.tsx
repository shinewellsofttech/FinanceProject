import { useEffect, useState } from "react";
import { Image, LI, P } from "../../../../AbstractElements";
import { dynamicImage } from "../../../../Service";
import ProfileBox from "./ProfileBox";

const UserProfile = () => {
  const [userName, setUserName] = useState("User");
  const [branchName, setBranchName] = useState("");

  useEffect(() => {
    const authData = localStorage.getItem("authUser");
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        setUserName(parsed.Name || parsed.UserName || "User");
      } catch (e) {
        // ignore
      }
    }

    const branchData = localStorage.getItem("selectedBranch");
    if (branchData) {
      try {
        const parsed = JSON.parse(branchData);
        if (parsed && parsed.name) {
          setBranchName(parsed.name);
        }
      } catch (e) {
        // ignore
      }
    }
  }, []);

  return (
    <LI className="profile-nav onhover-dropdown p-0 header-profile-logout">
      <div className="d-flex profile-media align-items-center">
        <Image className="b-r-10 img-40" src={dynamicImage("dashboard/profile.png")} alt="user" />
        <div className="flex-grow-1">
          <span>{userName}</span>
          <P className="mb-0 font-sm">{branchName}</P>
        </div>
      </div>
      <ProfileBox />
    </LI>
  );
};

export default UserProfile;
