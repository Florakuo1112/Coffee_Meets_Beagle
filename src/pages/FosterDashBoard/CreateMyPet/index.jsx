import { useState } from "react";
import { Sparkles } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";

import petsModulesQuery from "modules/petsModules/hook";
import petAPIModulesQuery from "modules/petAPIModules/hook";
import useAuthQuery from "modules/authModules/hook";

import { uploadImage } from "utils/uploadImage";
import LoadingFallback from "components/Loading";
import Popup from "components/Popup";
import NoPhoto from "components/NoPhoto";

import { catColorLabel, dogColorLabel, speciesLabel } from "types/labelTypes";

const defaultFormData = {
  name: "",
  species: "dog",
  breed: "",
  color_pattern: "yellow_brown",
  gender: "",
  age: "",
  neutered: false,
  personality: "",
  other: "",
  image_url: [],
};

function colorsForSpecies(species) {
  return species === "cat" ? catColorLabel : dogColorLabel;
}

function colorForSpecies(species, color) {
  const colors = colorsForSpecies(species);
  // 表單排除「不限」
  const usable = Object.fromEntries(
    Object.entries(colors).filter(([key]) => key !== "any"),
  );
  return Object.hasOwn(usable, color) ? color : Object.keys(usable)[0];
}

function CreateMyPet({ setIsCreatePet }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [frontBodyImageFile, setFrontBodyImageFile] = useState(null);
  const [sideBodyImageFile, setSideBodyImageFile] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [petId, setPetId] = useState(null);

  const {
    data: userProfile,
    isPending,
    isError,
    error,
  } = useAuthQuery.getUserProfile();
  const { mutateAsync: insertPet } = petsModulesQuery.insertPet();
  const { mutateAsync: createAnimalApiPet, isPending: isCreatingApiPet } =
    petAPIModulesQuery.createAnimalApiPet();
  const { mutateAsync: identifyBreed, isPending: isIdentifying } =
    petAPIModulesQuery.identifyBreed();

  if (isPending) return <LoadingFallback />;
  if (isError) {
    return (
      <Popup
        title="載入失敗"
        message={error?.message || "請重新登入後再試"}
        onConfirm={() => navigate({ to: "/login" })}
        confirmText="前往登入"
      />
    );
  }

  if (userProfile?.role && userProfile.role !== "foster") {
    return (
      <Popup
        title="無法使用送養專區"
        message="此功能僅開放給愛爸／愛媽帳號使用"
        onConfirm={() => navigate({ to: "/profile" })}
        confirmText="回到個人檔案"
      />
    );
  }

  const photoIndexByType = {
    profile: 0,
    front_body_photo: 1,
    side_body_photo: 2,
  };

  const handlePhotoChange = async (event, type = "profile") => {
    try {
      if (!userProfile?.id) throw new Error("找不到個人資料，請重新登入");

      const file = event.target.files?.[0];
      if (!file) return;

      if (type === "profile") setImageFile(file);
      else if (type === "front_body_photo") setFrontBodyImageFile(file);
      else if (type === "side_body_photo") setSideBodyImageFile(file);

      const url = await uploadImage(event, {
        bucket: "coffee_meets_beagle_pets",
        path: (file) =>
          `${userProfile.id}/pet-${Date.now()}.${file.name.split(".").pop()}`,
        setUploading,
        upsert: false,
      });

      if (!url) return;

      const index = photoIndexByType[type];
      if (index == null) return;

      setFormData((prev) => {
        const next = [...prev.image_url];
        next[index] = url;
        return { ...prev, image_url: next };
      });
    } catch (uploadError) {
      console.error("浪浪照片上傳失敗:", uploadError);
      alert(uploadError.message);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (uploading || isSaving) return;
    if (!formData.name.trim()) {
      alert("請填寫浪浪名字");
      return;
    }

    setIsSaving(true);
    try {
      if (!userProfile?.id) throw new Error("找不到個人資料，請重新登入");

      // 對齊 pets_information 欄位
      const payload = {
        foster_id: userProfile.id,
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || null,
        color_pattern: formData.color_pattern || null,
        image_url: formData.image_url || null,
        personality: formData.personality.trim() || null,
        gender: formData.gender || null,
        age: formData.age === "" ? null : Number(formData.age),
        neutered: Boolean(formData.neutered),
        other: formData.other.trim() || null,
        pet_API_id: petId,
      };

      await insertPet(payload);
      await queryClient.invalidateQueries({ queryKey: ["get", "pets"] });

      alert("浪浪資料新增成功！");
      setFormData(defaultFormData);
    } catch (saveError) {
      console.error("新增浪浪失敗:", saveError.message);
      alert("新增失敗：" + saveError.message);
    } finally {
      setIsSaving(false);
      setIsCreatePet(false);
    }
  };

  if (isSaving || isCreatingApiPet || isIdentifying) return <LoadingFallback />;

  const handleIdentifyBreed = async () => {
    const imageFiles = [
      imageFile,
      frontBodyImageFile,
      sideBodyImageFile,
    ].filter(Boolean);

    if (!imageFiles.length) {
      alert("請先上傳至少一張照片");
      return;
    }
    try {
      const hadPetId = Boolean(petId);
      let resolvedPetId = petId;

      // 先建立 pet，一有 id 立刻寫進 state（後續加圖失敗也不會丟）
      if (!resolvedPetId) {
        const petData = await createAnimalApiPet({
          species: formData.species,
        });
        resolvedPetId = petData.id;
        setPetId(resolvedPetId);
        console.log("🐾 The Dog/Cat API petId:", resolvedPetId);
      }

      const { zhBreed } = await identifyBreed({
        species: formData.species,
        imageFiles,
        petId: resolvedPetId,
        replaceImages: hadPetId,
      });
      setFormData((prev) => ({ ...prev, breed: zhBreed }));
    } catch (error) {
      console.error("❌ 發生錯誤:", error);
      alert(error.message || "品種辨識失敗");
    }
  };

  return (
    <form
      onSubmit={handleSave}
      className="mx-auto w-full max-w-md space-y-6 rounded-none bg-white p-4 shadow-md sm:max-w-xl sm:rounded-xl sm:p-6 md:max-w-2xl md:p-8"
    >
      <div className="mb-4">
        <h2 className="text-xl font-bold text-pink-600 sm:text-2xl">
          新增送養浪浪
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          上傳照片並填寫基本資料，讓領養人更快認識牠
        </p>
      </div>

      <div className="flex justify-between">
        <div className="flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-lg sm:h-40 sm:w-40">
            {formData.image_url[0] ? (
              <img
                src={formData.image_url[0]}
                alt="浪浪照片"
                className="h-full w-full object-cover"
              />
            ) : (
              <NoPhoto text="尚無照片" className=" h-full w-full " />
            )}
          </div>
          <div className="flex flex-col items-center">
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              浪浪照片
            </label>
            <label className="mt-1 inline-flex h-[30px] cursor-pointer items-center rounded-lg bg-pink-500 px-4 text-sm font-bold text-white hover:bg-pink-600">
              {"選擇照片"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handlePhotoChange(e, "profile")}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-lg sm:h-40 sm:w-40">
            {formData.image_url[1] ? (
              <img
                src={formData.image_url[1]}
                alt="浪浪正面照片"
                className="h-full w-full object-cover"
              />
            ) : (
              <NoPhoto text="尚無正面照片" className=" h-full w-full " />
            )}
          </div>
          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              浪浪正面照
            </label>
            <label className="mt-1 inline-flex h-[30px] cursor-pointer items-center rounded-lg bg-pink-500 px-4 text-sm font-bold text-white hover:bg-pink-600">
              {"選擇照片"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handlePhotoChange(e, "front_body_photo")}
                disabled={uploading}
              />
            </label>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div className="h-28 w-28 overflow-hidden rounded-lg sm:h-40 sm:w-40">
            {formData.image_url[2] ? (
              <img
                src={formData.image_url[2]}
                alt="浪浪側面照"
                className="h-full w-full object-cover"
              />
            ) : (
              <NoPhoto text="尚無側面照" className=" h-full w-full " />
            )}
          </div>
          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              浪浪側面照
            </label>
            <label className="mt-1 inline-flex h-[30px] cursor-pointer items-center rounded-lg bg-pink-500 px-4 text-sm font-bold text-white hover:bg-pink-600">
              {"選擇照片"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => handlePhotoChange(e, "side_body_photo")}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🐾 浪浪基本資料</h3>

        <div>
          <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
            名字
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="例如：小白、奶茶"
            className="w-full rounded-lg border p-2"
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              物種
            </label>
            <select
              value={formData.species}
              onChange={(e) => {
                const species = e.target.value;
                setFormData({
                  ...formData,
                  species,
                  color_pattern: colorForSpecies(
                    species,
                    formData.color_pattern,
                  ),
                });
              }}
              className="w-full rounded-lg border p-2"
            >
              {Object.entries(speciesLabel).map(([key, value]) => (
                <option key={key} value={key}>
                  {value}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex h-[30px] items-center">
              <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
                品種
              </label>
              <button
                type="button"
                onClick={handleIdentifyBreed}
                disabled={isIdentifying || !imageFile}
              >
                <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold bg-pink-50 text-pink-500 border border-pink-200 text-[14px] ml-2">
                  <Sparkles className="w-3 h-2" />
                  AI 辨識
                </span>
              </button>
            </div>

            <input
              type="text"
              value={formData.breed}
              onChange={(e) =>
                setFormData({ ...formData, breed: e.target.value })
              }
              placeholder="例如：米克斯、柴犬"
              className="w-full rounded-lg border p-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              花色
            </label>
            <select
              value={formData.color_pattern}
              onChange={(e) =>
                setFormData({ ...formData, color_pattern: e.target.value })
              }
              className="w-full rounded-lg border p-2"
            >
              {Object.entries(colorsForSpecies(formData.species))
                .filter(([key]) => key !== "any")
                .map(([key, value]) => (
                  <option key={key} value={key}>
                    {value}
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              性別
            </label>
            <select
              value={formData.gender}
              onChange={(e) =>
                setFormData({ ...formData, gender: e.target.value })
              }
              className="w-full rounded-lg border p-2"
            >
              <option value="">請選擇</option>
              <option value="male">公</option>
              <option value="female">母</option>
              <option value="unknown">未知</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
              年齡（歲）
            </label>
            <input
              type="number"
              min="0"
              value={formData.age}
              onChange={(e) =>
                setFormData({ ...formData, age: e.target.value })
              }
              placeholder="例如：2"
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div className="flex items-end pb-2">
            <label className="flex h-[30px] items-center gap-2 text-sm font-medium text-gray-600">
              <input
                type="checkbox"
                checked={formData.neutered}
                onChange={(e) =>
                  setFormData({ ...formData, neutered: e.target.checked })
                }
                className="h-5 w-5 rounded text-pink-500"
              />
              已結紮
            </label>
          </div>
        </div>

        <div>
          <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
            個性標籤
          </label>
          <input
            type="text"
            value={formData.personality}
            onChange={(e) =>
              setFormData({ ...formData, personality: e.target.value })
            }
            placeholder="例如：黏人, 安靜, 適合新手"
            className="w-full rounded-lg border p-2"
          />
        </div>

        <div>
          <label className="flex h-[30px] items-center text-sm font-medium text-gray-600">
            其他說明
          </label>
          <textarea
            rows="3"
            value={formData.other}
            onChange={(e) =>
              setFormData({ ...formData, other: e.target.value })
            }
            placeholder="例如：已完整疫苗、需與其他貓分開飼養..."
            className="w-full rounded-lg border p-2"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={uploading || isSaving}
        className="w-full rounded-lg bg-pink-500 p-3 font-bold text-white transition duration-200 hover:bg-pink-600 disabled:opacity-60"
      >
        {isSaving ? "儲存中..." : "新增浪浪資料"}
      </button>
      <button
        type="button"
        onClick={() => setIsCreatePet(false)}
        disabled={uploading || isSaving}
        className="w-full rounded-lg bg-pink-500 p-3 font-bold text-white transition duration-200 hover:bg-pink-600 disabled:opacity-60"
      >
        返回
      </button>
    </form>
  );
}

export default CreateMyPet;
