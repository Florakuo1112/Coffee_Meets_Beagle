import { useNavigate } from "@tanstack/react-router";

import useAuthQuery from "modules/authModules/hook";
import petsModulesQuery from "modules/petsModules/hook";

import LoadingFallback from "components/Loading";
import Popup from "components/Popup";

import { catColorLabel, dogColorLabel, speciesLabel } from "types/labelTypes";
import NoPhoto from "components/NoPhoto";

const genderLabel = {
  male: "公",
  female: "母",
  unknown: "未知",
};

function colorsForSpecies(species) {
  return species === "cat" ? catColorLabel : dogColorLabel;
}

function labelOf(labels, value) {
  if (value == null || value === "") return "尚未填寫";
  return labels[value] || value;
}

function formatPersonality(personality) {
  if (!personality) return "尚未填寫";
  if (Array.isArray(personality)) {
    const text = personality.filter(Boolean).join("、");
    return text || "尚未填寫";
  }
  return String(personality);
}

function Field({ label, value }) {
  return (
    <div>
      <p className="flex h-[30px] items-center text-sm font-medium text-gray-600">
        {label}
      </p>
      <p className="text-gray-800">{value}</p>
    </div>
  );
}

function PetCard({ pet }) {
  const colorLabels = colorsForSpecies(pet.species);
  const images = Array.isArray(pet.image_url)
    ? pet.image_url
    : pet.image_url
      ? [pet.image_url]
      : [];

  return (
    <article className="w-[90%] space-y-6 rounded-none bg-white p-4 shadow-md sm:rounded-xl sm:p-6 md:p-8 bg-gradient-to-br from-orange-100 to-pink-100 ">
      <div className="h-md:60  flex flex-col md:flex-row gap-6 p-6 rounded-2xl shadow-sm border border-pink-100 bg-white">
        {/* 左側：緊湊的 1+2 照片相簿區 */}
        <div className="flex w-full items-stretch gap-3 md:w-auto md:items-start">
          {/* 主照片：md 以下佔畫面一半，md 以上維持固定尺寸 */}
          <div className="aspect-square w-1/2 shrink-0 overflow-hidden rounded-xl shadow-sm md:h-50 md:w-50 md:aspect-auto">
            <img
              src={images[0]}
              alt={pet.name || "浪浪"}
              className="h-full w-full object-cover"
            />
          </div>

          {/* 右側兩張：md 以下佔滿剩餘空間並均分高度 */}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 md:flex-none">
            {images[1] ? (
              <div className="aspect-square shrink-0 overflow-hidden rounded-xl shadow-sm md:h-24 md:w-24 md:aspect-auto">
                <img
                  src={images[1]}
                  alt={pet.name || "浪浪"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square shrink-0 overflow-hidden rounded-xl shadow-sm md:h-24 md:w-24 md:aspect-auto">
                <NoPhoto
                  text="尚無正面照"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {images[2] ? (
              <div className="aspect-square shrink-0 overflow-hidden rounded-xl shadow-sm md:h-24 md:w-24 md:aspect-auto">
                <img
                  src={images[2]}
                  alt={pet.name || "浪浪"}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square shrink-0 overflow-hidden rounded-xl shadow-sm md:h-24 md:w-24 md:aspect-auto">
                <NoPhoto
                  text="尚無側面照"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* 右側：名字與 AI 辨識資訊區 */}
        <div className="flex flex-col justify-between py-1">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-3xl font-bold text-gray-800 tracking-wide">
                {pet.name || ""}
              </h2>
              <span className="px-3 py-1 text-xs font-semibold text-[#f6339a] bg-pink-100 rounded-full">
                待領養
              </span>
            </div>

            <p className="text-sm text-gray-500">
              AI品種辨識:{pet.breed?.zh_name || "尚未辨識"}
              {pet.breed?.confidance && (
                <span>(信心度{pet.breed.confidance}%)</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🐾 浪浪基本資料</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="物種" value={labelOf(speciesLabel, pet.species)} />
          <Field
            label="品種"
            value={
              typeof pet.breed === "object"
                ? pet.breed?.zh_name || "尚未填寫"
                : pet.breed || "尚未填寫"
            }
          />
          <Field label="花色" value={labelOf(colorLabels, pet.color_pattern)} />
          <Field label="性別" value={labelOf(genderLabel, pet.gender)} />
          <Field
            label="年齡（歲）"
            value={pet.age == null ? "尚未填寫" : `${pet.age} 歲`}
          />
          <Field label="結紮" value={pet.neutered ? "已結紮" : "尚未結紮"} />
        </div>

        <Field label="個性標籤" value={formatPersonality(pet.personality)} />
        <Field label="其他說明" value={pet.other || "尚未填寫"} />
      </div>
    </article>
  );
}

function ViewMyPet({ setIsCreatePet }) {
  const navigate = useNavigate();
  const {
    data: userProfile,
    isPending,
    isError,
    error,
  } = useAuthQuery.getUserProfile();
  const {
    data: pets,
    isPending: isPetsPending,
    isError: isPetsError,
    error: petsError,
  } = petsModulesQuery.getPetsByFosterId(userProfile?.id);

  if (isPending || isPetsPending) return <LoadingFallback />;

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

  if (isPetsError) {
    return (
      <Popup
        title="載入浪浪資料失敗"
        message={petsError?.message || "請稍後再試"}
        onConfirm={() => navigate({ to: "/foster-dashboard" })}
        confirmText="重新整理"
      />
    );
  }

  const petList = pets || [];

  return (
    <section className="mx-auto w-full max-w-md space-y-6 py-0 sm:max-w-xl md:max-w-2xl mx-2">
      <div className="flex justify-between py-4 px-4 bg-white sm:rounded-xl mb-0">
        <div>
          <h2 className="text-xl font-bold text-pink-600 sm:text-2xl">
            {userProfile?.display_name}的浪浪
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {petList.length > 0
              ? `共 ${petList.length} 隻，往下瀏覽所有資料`
              : "尚未新增任何浪浪"}
          </p>
        </div>
        <button
          className="rounded-md bg-pink-600 px-4 py-2 text-white"
          onClick={() => setIsCreatePet(true)}
        >
          新增浪浪
        </button>
      </div>

      {petList.length === 0 ? (
        <div className="rounded-none bg-white p-8 text-center shadow-md sm:rounded-xl">
          <p className="text-gray-500">目前沒有浪浪資料</p>
          <p className="mt-2 text-sm text-gray-400">
            請先在上方表單新增送養浪浪
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-8 flex flex-col items-center justify-center">
          {petList.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ViewMyPet;
