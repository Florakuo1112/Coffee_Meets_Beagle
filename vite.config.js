import { defineConfig } from "vite";
// react：處理 JSX / Fast Refresh
// reactCompilerPreset：提供 React Compiler 的 Babel preset
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
// Vite 8 / Rolldown 的 Babel 外掛，用來實際跑 React Compiler
import babel from "@rolldown/plugin-babel";
import jsconfigPaths from "vite-jsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  base: "/Coffee_Meets_Beagle/",
  plugins: [
    react(),
    // 啟用 React Compiler：建置時自動做 memoization
    babel({ presets: [reactCompilerPreset()] }),
    jsconfigPaths(),
    tailwindcss(),
  ],
});
