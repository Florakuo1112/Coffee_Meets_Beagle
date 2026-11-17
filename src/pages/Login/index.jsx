import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import useAuthQuery from "modules/authModules/hook";

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // hook 必須在元件頂層呼叫
  const { mutateAsync, isPending } = useAuthQuery.signInWithPassword();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await mutateAsync({ email, password });
      if (!data.user?.id) throw new Error("登入失敗，未取得使用者 ID");

      await queryClient.invalidateQueries({ queryKey: ["get", "userProfile"] });
      navigate({ to: "/profile" });
      alert("登入成功！請開始使用。");
    } catch (error) {
      console.error("登入發生錯誤:", error.message);
      alert("登入失敗：" + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="mx-auto max-w-md space-y-4 p-6">
      <h2 className="text-xl font-bold">登入 Coffee Meets Beagle</h2>

      <div>
        <label>Email：</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
      </div>

      <div>
        <label>密碼：</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full rounded border p-2"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-pink-500 p-2 font-bold text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {isPending ? "登入中..." : "登入"}
      </button>
    </form>
  );
}

export default Login;
