import { useMutation } from "@tanstack/react-query";
import { translateCatBreed, translateDogBreed } from "types/breedLabels";

const THE_DOG_API_KEY = import.meta.env.VITE_THE_DOG_API_KEY;
const THE_CAT_API_KEY = import.meta.env.VITE_THE_CAT_API_KEY;

const DOG_API_BASE = "https://api.thedogapi.com/v1";
const CAT_API_BASE = "https://api.thecatapi.com/v1";

function configForSpecies(species) {
  if (species === "cat") {
    return {
      baseUrl: CAT_API_BASE,
      apiKey: THE_CAT_API_KEY,
      translate: translateCatBreed,
    };
  }
  return {
    baseUrl: DOG_API_BASE,
    apiKey: THE_DOG_API_KEY,
    translate: translateDogBreed,
  };
}

async function readApiError(response, fallback) {
  const errBody = await response.json().catch(() => null);
  const detail = response.statusText
    ? `${response.status}: ${response.statusText}`
    : `${response.status}`;
  return new Error(errBody?.message || `${fallback} (${detail})`);
}

/** POST /pets — 只建立 pet（不含圖片），回傳 pet 資料 */
export async function createAnimalApiPet({ species }) {
  const { baseUrl, apiKey } = configForSpecies(species);
  if (!apiKey) throw new Error("缺少 API key");

  const response = await fetch(`${baseUrl}/pets`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
  });

  if (!response.ok) throw await readApiError(response, "建立寵物失敗");

  const petData = await response.json();
  if (!petData?.id) throw new Error("建立寵物成功但未回傳 id");
  return petData;
}

/** POST /pets/{petId}/genealogy — 品種辨識 */
export async function identifyAnimalApiGenealogy({ species, petId }) {
  const { baseUrl, apiKey } = configForSpecies(species);
  if (!apiKey) throw new Error("缺少 API key");
  if (!petId) throw new Error("缺少 pet id");

  const response = await fetch(`${baseUrl}/pets/${petId}/genealogy`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
  });

  if (!response.ok) throw await readApiError(response, "品種辨識失敗");
  return response.json();
}

/** POST /pets/{petId}/images — 為既有 pet 新增多張圖片 */
export async function addAnimalApiImage({ species, petId, imageFiles }) {
  const { baseUrl, apiKey } = configForSpecies(species);
  if (!apiKey) throw new Error("缺少 API key");
  if (!petId) throw new Error("缺少 pet id");

  const files = (imageFiles || []).filter(Boolean);
  if (!files.length) throw new Error("請先上傳照片");

  const body = new FormData();
  files.forEach((file) => body.append("images", file));

  const response = await fetch(`${baseUrl}/pets/${petId}/images`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body,
  });

  if (!response.ok) throw await readApiError(response, "新增寵物圖片失敗");
  return response.json();
}

/** 刪除該 pet 底下所有圖片（逐張 DELETE /images/{imageId}） */
export async function deleteAllAnimalApiImages({ species, petId }) {
  const { baseUrl, apiKey } = configForSpecies(species);
  if (!apiKey) throw new Error("缺少 API key");
  if (!petId) throw new Error("缺少 pet id");

  const petRes = await fetch(`${baseUrl}/pets/${petId}`, {
    headers: { "x-api-key": apiKey },
  });
  if (!petRes.ok) throw await readApiError(petRes, "取得寵物失敗");

  const pet = await petRes.json();
  const images = pet.images || [];

  await Promise.all(
    images.map(async (img) => {
      const res = await fetch(`${baseUrl}/images/${img.id}`, {
        method: "DELETE",
        headers: { "x-api-key": apiKey },
      });
      if (!res.ok) throw await readApiError(res, `刪除圖片失敗 (${img.id})`);
    }),
  );

  return { deleted: images.length };
}

/**
 * 上傳圖片 → 品種辨識（需先由呼叫端 createAnimalApiPet 取得 petId）
 * @returns {{ petId: string, breedLabel: string, zhBreed: string, isMixedBreed: boolean, confidence: number|null, result: object }}
 */
async function identifyBreedByPhoto({
  species,
  imageFiles,
  petId,
  replaceImages = false,
}) {
  const { translate } = configForSpecies(species);
  const files = (imageFiles || []).filter(Boolean);
  if (!petId) throw new Error("缺少 pet id");
  if (!files.length) throw new Error("請先上傳照片");

  if (replaceImages) {
    await deleteAllAnimalApiImages({ species, petId });
  }

  await addAnimalApiImage({
    species,
    petId,
    imageFiles: files,
  });

  const result = await identifyAnimalApiGenealogy({
    species,
    petId,
  });

  const breedLabel = result.genealogy?.primary_breed?.label ?? "";
  const confidence = result.genealogy?.primary_breed?.confidence ?? null;
  const isMixedBreed = Boolean(result.genealogy?.is_mixed_breed);
  const zhBreed = translate(breedLabel);
  const displayBreed = isMixedBreed ? zhBreed || "米克斯" : zhBreed;

  return {
    petId,
    breedLabel,
    zhBreed: displayBreed,
    isMixedBreed,
    confidence,
    result,
  };
}

const useIdentifyBreed = () => {
  return useMutation({
    mutationFn: identifyBreedByPhoto,
    meta: { showGlobalLoading: true },
  });
};

const useCreateAnimalApiPet = () => {
  return useMutation({
    mutationFn: createAnimalApiPet,
    meta: { showGlobalLoading: true },
  });
};

const petAPIModulesQuery = {
  identifyBreed: useIdentifyBreed,
  createAnimalApiPet: useCreateAnimalApiPet,
};

export default petAPIModulesQuery;
