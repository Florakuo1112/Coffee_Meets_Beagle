import {
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  lazyRouteComponent,
} from "@tanstack/react-router";

import LoadingFallback from "./components/Loading";
import Layout from "./layouts/Layout.jsx";

function App() {
  // Layout
  const rootRoute = createRootRoute({ component: () => <Layout /> });
  // Routes

  const routeTree = rootRoute.addChildren([
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/",
      component: lazyRouteComponent(() => import("./pages/Home")),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/home",
      component: lazyRouteComponent(() => import("./pages/Home")),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/register",
      component: lazyRouteComponent(() => import("./pages/Register")),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/login",
      component: lazyRouteComponent(() => import("./pages/Login")),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "/profile",
      component: lazyRouteComponent(() => import("./pages/Profile")),
    }),
    createRoute({
      getParentRoute: () => rootRoute,
      path: "*",
      component: lazyRouteComponent(() => import("./pages/Error404")),
    }),
  ]);

  const router = createRouter({
    routeTree,
    basepath: "/Coffee_Meets_Beagle",
    defaultPendingComponent: () => <LoadingFallback />,
  });

  return <RouterProvider router={router} />;
}

export default App;
