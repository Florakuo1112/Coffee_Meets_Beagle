import { useLayoutEffect, useRef, useState } from "react";

function Child({ label }) {
  const countElRef = useRef(null);
  const renderCountRef = useRef(0);

  // 計數放在 effect，不要在 render 裡改 ref（否則 Compiler 會 bailout）
  useLayoutEffect(() => {
    renderCountRef.current += 1;
    if (countElRef.current) {
      countElRef.current.textContent = String(renderCountRef.current);
    }
    console.log("[Child] committed，次數 =", renderCountRef.current);
  });

  return (
    <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
      <p className="font-semibold text-pink-700">Child</p>
      <p>props.label：{label}</p>
      <p className="text-2xl font-bold text-pink-600">
        實際重渲染次數：<span ref={countElRef}>0</span>
      </p>
      <p className="mt-2 text-sm text-stone-600">
        父層只改 count 時，若 Compiler 有生效，這裡不應增加。
      </p>
    </div>
  );
}

function Home() {
  const [count, setCount] = useState(0);
  const [label, setLabel] = useState("Beagle");
  const countElRef = useRef(null);
  const renderCountRef = useRef(0);

  useLayoutEffect(() => {
    renderCountRef.current += 1;
    if (countElRef.current) {
      countElRef.current.textContent = String(renderCountRef.current);
    }
    console.log("[Parent] committed，次數 =", renderCountRef.current);
  });

  return (
    <div className="mx-auto max-w-xl space-y-4 p-6">
      <h1 className="text-2xl font-bold text-stone-800">
        React Compiler 渲染測試
      </h1>

      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <p className="font-semibold text-stone-700">Parent</p>
        <p className="text-2xl font-bold text-stone-800">
          實際重渲染次數：<span ref={countElRef}>0</span>
        </p>
        <p className="mt-1 text-stone-600">count：{count}</p>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg bg-stone-800 px-3 py-2 text-white"
            onClick={() => setCount((n) => n + 1)}
          >
            只更新 Parent（count + 1）
          </button>
          <button
            type="button"
            className="rounded-lg bg-pink-500 px-3 py-2 text-white"
            onClick={() => setLabel((text) => `${text}!`)}
          >
            更新 Child 的 props
          </button>
        </div>
      </div>

      <Child label={label} />

      <ul className="list-disc space-y-1 pl-5 text-sm text-stone-600">
        <li>
          連按「只更新 Parent」：Parent 次數上升，Child 不動 → Compiler
          有跳過 Child。
        </li>
        <li>
          按「更新 Child 的 props」：Parent 與 Child 都會增加（兩邊都該更新）。
        </li>
        <li>也可開 Console 看 `[Parent]` / `[Child]` 日誌。</li>
        <li>
          開發模式 StrictMode 第一次進頁可能多跑一次，屬正常。
        </li>
      </ul>
    </div>
  );
}

export default Home;
