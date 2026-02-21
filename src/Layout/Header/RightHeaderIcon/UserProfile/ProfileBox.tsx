import { Link } from "react-router-dom";
import { FeatherIcons, LI, UL } from "../../../../AbstractElements";
import { profilesMessage } from "../../../../Data/LayoutData/HeaderData";

const ProfileBox = () => {
  const handleClick = (name: string) => {
    if (name === "Log Out") {
      localStorage.removeItem("login");
      localStorage.removeItem("authUser");
    }
  };

  return (
    <UL className="profile-dropdown onhover-show-div simple-list">

      <LI>
        <Link to={`${process.env.PUBLIC_URL || ""}/changePassword`}>
          <FeatherIcons iconName="Lock" />
          <span>Change Password</span>
        </Link>
      </LI>
      {profilesMessage.map((data, index) => (
        <LI key={index}>
          <Link to={data.link} onClick={() => handleClick(data.name)}>
            <FeatherIcons iconName={data.icon} />
            <span>{data.name} </span>
          </Link>
        </LI>
      ))}
    </UL>
  );
};

export default ProfileBox;
