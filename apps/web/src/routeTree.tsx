import { Route, RootRoute } from "@tanstack/react-router";
import RootLayout from "./routes/__root";
import IndexPage from "./routes/index";
import AdminPage from "./routes/admin";
import GalleryPage from "./routes/gallery";

const rootRoute = new RootRoute({
  component: RootLayout,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});

const adminRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const galleryRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/gallery",
  component: GalleryPage,
});

export const routeTree = rootRoute.addChildren([
  indexRoute,
  adminRoute,
  galleryRoute,
]);
