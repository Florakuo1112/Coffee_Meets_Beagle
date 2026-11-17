import { useNavigate } from "@tanstack/react-router";

import useAuthQuery from "modules/authModules/hook";
import petsModulesQuery from "modules/petsModules/hook";

import CreateMyPet from "../CreateMyPet";
import LoadingFallback from "components/Loading";
import Popup from "components/Popup";

import { catColorLabel, dogColorLabel, speciesLabel } from "types/labelTypes";

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

  return (
    <article className="w-full space-y-6 rounded-none bg-white p-4 shadow-md sm:rounded-xl sm:p-6 md:p-8">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <div className="h-28 w-28 overflow-hidden rounded-lg border bg-gray-100 sm:h-40 sm:w-40">
          {pet.image_url ? (
            <img
              src={pet.image_url}
              alt={pet.name || "浪浪照片"}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-400">
              尚無照片
            </div>
          )}
        </div>
        <div>
          <p className="flex h-[30px] items-center text-sm font-medium text-gray-600">
            浪浪名字
          </p>
          <p className="text-xl font-bold text-gray-800">
            {pet.name || "尚未命名"}
          </p>
        </div>
      </div>

      <hr className="my-2" />

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-pink-600">🐾 浪浪基本資料</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="物種" value={labelOf(speciesLabel, pet.species)} />
          <Field label="品種" value={pet.breed || "尚未填寫"} />
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
    <section className="mx-auto w-full max-w-md space-y-6 sm:max-w-xl md:max-w-2xl">
      <div className="rounded-none bg-white p-4 shadow-md sm:rounded-xl sm:p-6">
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
        <div className="space-y-6 pb-8">
          {petList.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
      )}
    </section>
  );
}

export default ViewMyPet;
