import { useEffect } from "react";
import { supabase } from "utils/supabaseClient";
import { Outlet, useNavigate } from "@tanstack/react-router";
import {
  useIsFetching,
  useIsMutating,
  useQueryClient,
} from "@tanstack/react-query";

import useAuthQuery from "modules/authModules/hook";

import Header from "../components/Header.jsx";
import Loading from "../components/Loading.jsx";

function Layout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isFetching = useIsFetching({
    predicate: (query) => query.meta?.showGlobalLoading,
  });
  const isMutating = useIsMutating({
    predicate: (mutation) => mutation.meta?.showGlobalLoading,
  });
  const { data: session } = useAuthQuery.getSession();
  const { mutateAsync: signOut } = useAuthQuery.signOut();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      queryClient.setQueryData(["get", "session"], nextSession);

      if (event === "SIGNED_OUT") {
        queryClient.removeQueries({ queryKey: ["get", "userProfile"] });
        queryClient.setQueryData(["get", "session"], null);
      }
      if (event === "SIGNED_IN") {
        queryClient.invalidateQueries({ queryKey: ["get", "userProfile"] });
      }
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const handleSignOut = async () => {
    try {
      await signOut();
      queryClient.setQueryData(["get", "session"], null);
      queryClient.removeQueries({ queryKey: ["get", "userProfile"] });
      navigate({ to: "/login" });
    } catch (error) {
      console.error("登出失敗:", error.message);
      alert("登出失敗：" + error.message);
    }
  };

  return (
    <div className="relative">
      <Header user={session?.user ?? null} onSignOut={handleSignOut} />
      {Boolean(isFetching || isMutating) && <Loading />}
      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
