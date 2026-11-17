import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import useAuthQuery from "modules/authModules/hook";
import profileModulesQuery from "modules/profileModules/hook";

function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("adopter"); // 預設為領養人
  const { mutateAsync: signUp, isPending } = useAuthQuery.signUp();
  const { mutateAsync: insertProfile } = profileModulesQuery.insertProfile();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const data = await signUp({ email, password });
      if (!data.user?.id) throw new Error("註冊失敗，未取得使用者 ID");

      await insertProfile({
        id: data.user.id,
        display_name: displayName,
        role: role,
        profile_data: role === "adopter" ? { hasBalconyProtection: false } : {},
      });

      alert("註冊成功！請登入或開始使用。");
      // 導向到首頁或登入頁
      navigate({ to: "/" });
    } catch (error) {
      console.error("註冊發生錯誤:", error.message);
      alert("註冊失敗：" + error.message);
    }
  };

  return (
    <form onSubmit={handleRegister} className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">加入 Coffee Meets Beagle</h2>

      <div>
        <label>稱呼：</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

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

      <div>
        <label>您的身分：</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 w-full rounded"
        >
          <option value="adopter">尋找毛孩的領養人 (Adopter)</option>
          <option value="foster">幫浪浪找家的愛媽/愛爸 (Foster)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded bg-pink-500 p-2 font-bold text-white hover:bg-pink-600 disabled:opacity-60"
      >
        {isPending ? "註冊中..." : "確認註冊"}
      </button>
    </form>
  );
}

export default Register;
