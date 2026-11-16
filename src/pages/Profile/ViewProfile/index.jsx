import LoadingFallback from "components/Loading";
import useUserProfileQuery from "modules/hook";
import { useNavigate } from "@tanstack/react-router";

import {
  ageLabel,
  catColorLabel,
  dogColorLabel,
  housingLabel,
  sizeLabel,
  speciesLabel,
} from "types/animalTypes";

import Popup from "components/Popup";

function labelOf(labels, value) {
  if (!value) return "尚未填寫";
  return labels[value] || value;
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <p className="mt-1 text-gray-800">{value}</p>
    </div>
  );
}

export default function ViewProfile({ setIsEditing }) {
  const navigate = useNavigate();
  const {
    data: userProfile,
    isPending,
    isError,
    error,
  } = useUserProfileQuery.getUserProfile();

  if (isPending) return <LoadingFallback />;

  if (isError) {
    return (
      <Popup
        title="載入個人資料失敗"
        message={error?.message || "請重新登入後再試"}
        onConfirm={() => navigate({ to: "/login" })}
        confirmText="前往登入"
      />
    );
  }

  const displayName = userProfile?.display_name || "";
  const avatarUrl = userProfile?.avatar_url || "";
  const profile = userProfile?.profile_data || {};

  return (
    <section className="mx-auto mb-6 max-w-xl space-y-6 rounded-xl bg-white p-6 shadow-md">
      <div className="mb-2">
        <h2 className="mb-3 text-2xl font-bold text-gray-800">領養人檔案</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="h-24 w-24 overflow-hidden rounded-lg border bg-gray-100">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="個人照片"
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              尚無照片
            </div>
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">領養人</p>
          <p className="text-xl font-bold text-gray-800">
            {displayName || "尚未設定名稱"}
          </p>
          <button
            className="text-sm text-blue-500 hover:text-blue-700"
            onClick={() => setIsEditing(true)}
          >
            編輯
          </button>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🏠 居住與環境狀況</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="居住類型"
            value={labelOf(housingLabel, profile.housingType)}
          />
          <Field
            label="養寵物經驗"
            value={`${profile.experienceYears || 0} 年`}
          />
        </div>
        <Field
          label="防墜安全"
          value={
            profile.hasBalconyProtection
              ? "陽台與窗戶已做好防護網"
              : "尚未設定防護網"
          }
        />
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🐾 理想毛孩</h3>
        <div className="grid grid-cols-2 gap-4">
          <Field
            label="物種"
            value={labelOf(speciesLabel, profile.preferredSpecies)}
          />
          <Field
            label="年齡層"
            value={labelOf(ageLabel, profile.preferredAge)}
          />
          <Field
            label="花色"
            value={labelOf(
              profile.preferredSpecies === "cat"
                ? catColorLabel
                : dogColorLabel,
              profile.preferredColor,
            )}
          />
          {profile.preferredSpecies === "dog" && (
            <Field
              label="體型"
              value={labelOf(sizeLabel, profile.preferredSize)}
            />
          )}
        </div>
        <Field
          label="自我介紹或對毛孩的期望"
          value={profile.notes || "尚未填寫"}
        />
      </div>
    </section>
  );
}
