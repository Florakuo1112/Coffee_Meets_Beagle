import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

import { uploadImage } from "utils/uploadImage";

import useUserProfileQuery from "modules/hook";
import { useNavigate } from "@tanstack/react-router";

import LoadingFallback from "components/Loading";
import Popup from "components/Popup";

import {
  ageLabel,
  catColorLabel,
  dogColorLabel,
  housingLabel,
  sizeLabel,
  speciesLabel,
} from "types/animalTypes";

const defaultFormData = {
  housingType: "",
  hasBalconyProtection: false,
  experienceYears: 0,
  preferredSpecies: "dog",
  preferredAge: "adult",
  preferredColor: "yellow_brown",
  preferredSize: "any",
  notes: "",
};

function colorsForSpecies(species) {
  return species === "cat" ? catColorLabel : dogColorLabel;
}

function colorForSpecies(species, color) {
  const colors = colorsForSpecies(species);
  return Object.hasOwn(colors, color) ? color : Object.keys(colors)[0];
}

function EditProfile({ setIsEditing }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  // 存在 profile_data 裡的表單欄位
  const [formData, setFormData] = useState(defaultFormData);

  const {
    data: userProfile,
    isPending,
    isError,
    error,
  } = useUserProfileQuery.getUserProfile();

  // useEffect 只負責把資料寫進表單 state，不要在這裡 return JSX
  useEffect(() => {
    if (!userProfile) return;

    const next = {
      ...defaultFormData,
      ...userProfile.profile_data,
    };
    next.preferredColor = colorForSpecies(
      next.preferredSpecies,
      next.preferredColor,
    );

    setFormData(next);
    setDisplayName(userProfile.display_name || "");
    setAvatarUrl(userProfile.avatar_url || "");
  }, [userProfile]);

  // Loading / 錯誤畫面要寫在元件 render 裡
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

  const handleAvatarChange = async (event) => {
    try {
      if (!userProfile?.id) throw new Error("找不到個人資料，請重新登入");

      const url = await uploadImage(event, {
        bucket: "coffee_meets_beagle_avatars",
        // 用時間戳當新檔名，只需要 INSERT policy，不必 upsert/UPDATE
        path: (file) =>
          `${userProfile.id}/avatar-${Date.now()}.${file.name.split(".").pop()}`,
        setUploading,
        upsert: false,
      });

      if (!url) return;

      const { data, error } = await supabase
        .from("profiles")
        .update({ avatar_url: url })
        .eq("id", userProfile.id)
        .select("avatar_url");

      if (error) {
        console.error("profiles 更新失敗:", error);
        throw new Error(`資料庫寫入失敗：${error.message}`);
      }
      if (!data?.length) throw new Error("找不到個人資料，照片網址沒有寫入");
      setAvatarUrl(url);
    } catch (error) {
      console.error("照片流程失敗:", error);
      alert(error.message);
    }
  };

  // 2. 儲存表單資料到 Supabase
  const handleSave = async (e) => {
    e.preventDefault();
    if (uploading || isSaving) return;
    setIsSaving(true);
    try {
      if (!userProfile?.id) throw new Error("找不到個人資料，請重新登入");

      const { error } = await supabase
        .from("profiles")
        .update({
          profile_data: formData,
          avatar_url: avatarUrl,
        })
        .eq("id", userProfile.id)
        .select();

      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ["get", "userProfile"] });
      alert("個人與理想寵物資料儲存成功！");
      setIsEditing(false);
    } catch (error) {
      console.error("儲存失敗:", error.message);
      alert("儲存失敗：" + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isSaving) return <LoadingFallback />;

  return (
    <form
      onSubmit={handleSave}
      className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md space-y-6"
    >
      <div className="mb-2">
        <h2 className="text-2xl font-bold text-gray-800">
          編輯領養人檔案與理想寵物
        </h2>
      </div>

      {/* 基本資料 */}
      <div className="space-y-2">
        <label className="block font-semibold text-gray-700">
          顯示名稱 (Display Name)
        </label>
        <input
          type="text"
          value={displayName}
          className="w-full border p-2 rounded-lg bg-gray-100 text-gray-500"
          disabled
        />
      </div>

      <div className="flex items-center gap-4">
        <div className="h-40 w-40 overflow-hidden rounded-lg border bg-gray-100">
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
          <label className="block text-sm font-medium text-gray-600">
            個人照片
          </label>
          <label className="mt-1 inline-block cursor-pointer rounded-lg bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-600">
            {uploading ? "上傳中..." : "選擇照片"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <hr className="my-4" />

      {/* 居住與環境狀況 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🏠 居住與環境狀況</h3>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            居住類型
          </label>
          <select
            value={formData.housingType}
            onChange={(e) =>
              setFormData({ ...formData, housingType: e.target.value })
            }
            className="w-full border p-2 rounded-lg"
          >
            <option value="">請選擇</option>
            {Object.entries(housingLabel).map(([key, value]) => (
              <option key={key} value={key}>
                {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="balcony"
            checked={formData.hasBalconyProtection}
            onChange={(e) =>
              setFormData({
                ...formData,
                hasBalconyProtection: e.target.checked,
              })
            }
            className="w-5 h-5 text-pink-500 rounded"
          />
          <label
            htmlFor="balcony"
            className="text-sm font-medium text-gray-600 ms-2"
          >
            陽台與窗戶皆有做好防護網（防墜安全）
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            養寵物經驗（年）
          </label>
          <input
            type="number"
            min="0"
            value={formData.experienceYears}
            onChange={(e) =>
              setFormData({
                ...formData,
                experienceYears: Number(e.target.value),
              })
            }
            className="w-full border p-2 rounded-lg"
          />
        </div>
      </div>

      <hr className="my-4" />

      {/* 理想寵物條件 */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🐾 設定您的理想毛孩</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              想尋找的物種
            </label>
            <select
              value={formData.preferredSpecies}
              onChange={(e) => {
                const preferredSpecies = e.target.value;
                setFormData({
                  ...formData,
                  preferredSpecies,
                  preferredColor: colorForSpecies(
                    preferredSpecies,
                    formData.preferredColor,
                  ),
                });
              }}
              className="w-full border p-2 rounded-lg"
            >
              {Object.entries(speciesLabel).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">
              偏好年齡層
            </label>
            <select
              value={formData.preferredAge}
              onChange={(e) =>
                setFormData({ ...formData, preferredAge: e.target.value })
              }
              className="w-full border p-2 rounded-lg"
            >
              {Object.entries(ageLabel).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">
              想尋找的花色
            </label>
            <select
              value={formData.preferredColor}
              onChange={(e) =>
                setFormData({ ...formData, preferredColor: e.target.value })
              }
              className="w-full border p-2 rounded-lg"
            >
              {Object.entries(colorsForSpecies(formData.preferredSpecies)).map(
                ([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ),
              )}
            </select>
          </div>

          {formData.preferredSpecies === "dog" && (
            <div>
              <label className="block text-sm font-medium text-gray-600">
                體型
              </label>
              <select
                value={formData.preferredSize}
                onChange={(e) =>
                  setFormData({ ...formData, preferredSize: e.target.value })
                }
                className="w-full border p-2 rounded-lg"
              >
                {Object.entries(sizeLabel).map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600">
            自我介紹或對毛孩的期望
          </label>
          <textarea
            rows="3"
            value={formData.notes}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="例如：生活作息穩定，希望能找一隻個性撒嬌、適合陪伴居家辦公的貓咪..."
            className="w-full border p-2 rounded-lg"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading}
        className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold p-3 rounded-lg transition duration-200 disabled:opacity-60"
      >
        儲存設定
      </button>

      <button
        type="button"
        onClick={() => setIsEditing(false)}
        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold p-3 rounded-lg transition duration-200 disabled:opacity-60"
      >
        返回
      </button>
    </form>
  );
}

export default EditProfile;
