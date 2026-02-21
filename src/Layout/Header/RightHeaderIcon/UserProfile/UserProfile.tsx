import { Image, LI, P } from "../../../../AbstractElements";
import { dynamicImage } from "../../../../Service";
import ProfileBox from "./ProfileBox";

const UserProfile = () => {
  return (
    <LI className="profile-nav onhover-dropdown p-0 header-profile-logout">
      <div className="d-flex profile-media align-items-center">
        <Image className="b-r-10 img-40" src={dynamicImage("dashboard/profile.png")} alt="user" />
        <div className="flex-grow-1">
          <span>{"Alen Miller"}</span>
          <P className="mb-0">{"UI Designer"}</P>
        </div>
      </div>
      <ProfileBox />
    </LI>
  );
};

export default UserProfile;
