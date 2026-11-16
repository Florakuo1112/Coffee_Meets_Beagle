import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "utils/supabaseClient";
import { useQueryClient } from "@tanstack/react-query";

function Login() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. 呼叫 Supabase 內建註冊 API
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (authError) throw authError;

      const userId = authData.user.id;
      if (!userId) throw new Error("登入失敗，未取得使用者 ID");
      navigate({ to: "/profile" });
      queryClient.invalidateQueries({ queryKey: ["get", "userProfile"] });
      alert("登入成功！請開始使用。");
    } catch (error) {
      console.error("登入發生錯誤:", error.message);
      alert("登入失敗：" + error.message);
    }
  };

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">登入 Coffee Meets Beagle</h2>

      <div>
        <label>Email：</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label>密碼：</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <button
        type="submit"
        className="bg-pink-500  text-white p-2 w-full rounded font-bold hover:bg-pink-600"
      >
        登入
      </button>
    </form>
  );
}

export default Login;
