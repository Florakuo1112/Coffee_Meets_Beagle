import { useState } from "react";
import useAuthQuery from "modules/authModules/hook";
import LoadingFallback from "components/Loading";
import EditProfile from "./EditProfile";
import ViewProfile from "./ViewProfile";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const {
    data: userProfile,
    isPending,
    isError,
    error,
  } = useAuthQuery.getUserProfile();

  const role = userProfile?.role;

  if (isPending) return <LoadingFallback />;
  if (isError) return <p>載入失敗：{error?.message}</p>;
  if (!role) return <p>尚無角色資料</p>;

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
