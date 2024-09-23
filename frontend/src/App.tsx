import { ChakraProvider } from "@chakra-ui/react";
import { Refine, Authenticated } from "@refinedev/core";
import dataProvider from "@refinedev/simple-rest";
import {
  // AuthPage,
  ThemedLayoutV2,
  RefineThemes,
  ErrorComponent,
  ThemedSiderV2,
} from "@refinedev/antd";

import { ColorModeContextProvider } from "./contexts/color-mode";


import routerProvider, {
  CatchAllNavigate,
  NavigateToResource,
  UnsavedChangesNotifier,
  DocumentTitleHandler,
} from "@refinedev/react-router-v6";
import { ConfigProvider, theme } from "antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { authProvider } from "./authProvider";
import Login from "./pages/login/login"; // Import your new Login component

// import { DashboardPage } from "./pages/dashboard"; // Your custom dashboard page
import {
  BlogPostCreate,
  BlogPostEdit,
  BlogPostList,
  BlogPostShow,
} from "./pages/blog-posts";
import {
  CategoryCreate,
  CategoryEdit,
  CategoryList,
  CategoryShow,
} from "./pages/categories";
import {
  ScheduleList
} from "./pages/schedule"
import { Header } from "./components/header"; // Custom header if you have one
import { WFHForm } from "./pages/wfh-application"
import { ChakraProvider } from "@chakra-ui/react";
import { useCustomNotificationProvider } from "./components/toast";

const App = () => {
  return (
    <BrowserRouter>
    <ChakraProvider>
    <ColorModeContextProvider>
      <ConfigProvider>
        <ChakraProvider>
          <Refine
            dataProvider={dataProvider("https://api.fake-rest.refine.dev")}
            routerProvider={routerProvider}
            authProvider={authProvider}
            notificationProvider={useCustomNotificationProvider} // Use ChakraUI's notification provider
            resources={[
              {
                name: "Schedule",
                list: ScheduleList,
                meta: {
                  canDelete: false,
                },
              },
              {
                name: "blog_posts",
                list: "/blog-posts",
                create: "/blog-posts/create",
                edit: "/blog-posts/edit/:id",
                show: "/blog-posts/show/:id",
                meta: {
                  canDelete: true,
                },
              },
              {
                name: "categories",
                list: "/categories",
                create: "/categories/create",
                edit: "/categories/edit/:id",
                show: "/categories/show/:id",
                meta: {
                  canDelete: true,
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
              useNewQueryKeys: true,
              projectId: "cvDbbL-7DVGFW-l9PPN7",
            }}
          >
            <Routes>
              {/* Authenticated routes with layout */}
              <Route
                element={
                  <Authenticated
                    key="authentication-inner"
                    fallback={<CatchAllNavigate to="/login" />}
                  >
                    <ThemedLayoutV2
                      Header={Header}
                      Sider={(props) => <ThemedSiderV2 {...props} fixed />}
                    >
                      <Outlet />
                    </ThemedLayoutV2>
                  </Authenticated>
                }
              >
                {/* Default route to the dashboard */}
                {/* <Route index element={<DashboardPage />} /> */}
                {/* Schedule Routes */}
                <Route path="/schedule">
                  <Route index element={<ScheduleList />} />
                </Route>
                <Route path="/wfhform" element={ < WFHForm/>}/>
                {/* Blog Posts Routes */}
                <Route path="/blog-posts">
                  <Route index element={<BlogPostList />} />
                  <Route path="create" element={<BlogPostCreate />} />
                  <Route path="edit/:id" element={<BlogPostEdit />} />
                  <Route path="show/:id" element={<BlogPostShow />} />
                </Route>

                {/* Categories Routes */}
                <Route path="/categories">
                  <Route index element={<CategoryList />} />
                  <Route path="create" element={<CategoryCreate />} />
                  <Route path="edit/:id" element={<CategoryEdit />} />
                  <Route path="show/:id" element={<CategoryShow />} />
                </Route>

                {/* Error page */}
                <Route path="*" element={<ErrorComponent />} />
              </Route>

              {/* Unauthenticated route (Login Page) */}
              <Route path="/login" element={<Login />} />

              {/* Redirect to resource if authenticated */}
              <Route
                element={
                  <Authenticated key="authentication-inner" fallback={<Outlet />}>
                    <NavigateToResource />
                  </Authenticated>
                }
              />
            </Routes>
            <UnsavedChangesNotifier />
            <DocumentTitleHandler />
          </Refine>
        </ChakraProvider>
      </ConfigProvider>
    </ColorModeContextProvider>
    </ChakraProvider>
    </BrowserRouter>
  );
};

export default App;
