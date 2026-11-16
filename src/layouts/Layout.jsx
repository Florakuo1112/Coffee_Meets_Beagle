import { useEffect, useState } from "react";
import { supabase } from "utils/supabaseClient";
import { Outlet, useNavigate } from "@tanstack/react-router";
import {
  useIsFetching,
  useIsMutating,
  useQueryClient,
} from "@tanstack/react-query";

import Header from "../components/Header.jsx";
import Loading from "../components/Loading.jsx";

function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.showGlobalLoading,
  });
  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.showGlobalLoading,
  });

  useEffect(() => {
    // 進頁時先抓目前 session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // 之後聽登入 / 登出變化，並清掉舊帳號的 profile 快取
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["get", "userProfile"] });
      }

      if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: ["get", "userProfile"] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    queryClient.removeQueries({ queryKey: ["get", "userProfile"] });
    navigate({ to: "/login" });
  };

  return (
    <div className="relative">
      <Header user={user} onSignOut={handleSignOut} />
      {Boolean(isFetching || isMutating) && <Loading />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
