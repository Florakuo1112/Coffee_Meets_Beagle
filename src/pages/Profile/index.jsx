import { useState } from "react";
import useUserProfileQuery from "modules/hook";
import EditProfile from "./EditProfile";
import ViewProfile from "./ViewProfile";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const { data: userProfile } = useUserProfileQuery.getUserProfile();
  const role = userProfile?.role;

  return (
    <div>
      {role === "adopter" &&
        (isEditing ? (
          <EditProfile setIsEditing={setIsEditing} />
        ) : (
          <ViewProfile setIsEditing={setIsEditing} />
        ))}

      {role === "foster" && "foster page"}
    </div>
  );
}
