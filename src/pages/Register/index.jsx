import { useState } from 'react'
import { supabase } from 'utils/supabaseClient'

function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState('adopter') // 預設為領養人

  const handleRegister = async e => {
    e.preventDefault()

    try {
      // 1. 呼叫 Supabase 內建註冊 API
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })

      if (authError) throw authError

      const userId = authData.user?.id
      if (!userId) throw new Error('註冊失敗，未取得使用者 ID')

      // 2. 將額外資料（display_name, role）寫入我們自定義的 profiles 表
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: userId, // 必須對應 auth.users 的 uuid
          display_name: displayName,
          role: role, // 'adopter' 或 'foster'
          profile_data:
            role === 'adopter'
              ? { housingType: 'apartment', hasBalconyProtection: false } // 領養人初始問卷
              : { city: '台北市', experienceYears: 1 } // 愛媽初始背景
        }
      ])

      if (profileError) throw profileError

      alert('註冊成功！請登入或開始使用。')
      // 導向到首頁或登入頁
    } catch (error) {
      console.error('註冊發生錯誤:', error.message)
      alert('註冊失敗：' + error.message)
    }
  }

  return (
    <form onSubmit={handleRegister} className="p-6 max-w-md mx-auto space-y-4">
      <h2 className="text-xl font-bold">加入 Coffee Meets Beagle</h2>

      <div>
        <label>稱呼：</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label>Email：</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label>密碼：</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          className="border p-2 w-full rounded"
        />
      </div>

      <div>
        <label>您的身分：</label>
        <select value={role} onChange={e => setRole(e.target.value)} className="border p-2 w-full rounded">
          <option value="adopter">尋找毛孩的領養人 (Adopter)</option>
          <option value="foster">幫浪浪找家的愛媽/愛爸 (Foster)</option>
        </select>
      </div>

      <button type="submit" className="bg-primary-burnt-orange text-white p-2 w-full rounded font-bold">
        確認註冊
      </button>
    </form>
  )
}

export default Register
