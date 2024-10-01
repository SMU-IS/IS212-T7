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
import { TeamScheduleList } from "./pages/team-schedule"
import { Typography } from 'antd';
import logo from "@/assets/logo.png"

// import { useCustomNotificationProvider } from "./components/toast";

const API_URL = import.meta.env.VITE_BACKEND_URL;
const App = () => {
  const { Title } = Typography;
  const CustomTitle = () => (
    <div style={{display: "flex", alignContent: "center"}}>
      <div style={{alignContent: "center"}}>
        <img 
          src={logo} 
          alt="Sayless Logo" 
          style={{ height: "30px", marginRight: "5px" }} // Adjust width and height as needed
        />
      </div>
      <Title level={3} style={{ 
        textAlign: 'center', 
        color: '#15B392',
        fontWeight: 'bold',
        margin: 0,
        alignContent: "center"
        }}
        >
          SAYLESS
      </Title>
    </div>
);
  return (
    <BrowserRouter>
    <ChakraProvider>
    <ColorModeContextProvider>
      <ConfigProvider>
        <ChakraProvider>
          <Refine
            dataProvider={dataProvider(API_URL)}
            routerProvider={routerProvider}
            authProvider={authProvider}
            // notificationProvider={useCustomNotificationProvider} // Use ChakraUI's notification provider
            resources={[
              {
                name: "schedule",
                list: ScheduleList,
                meta: {
                  canDelete: false,
                  label: "My Schedule"
                },
              },
              {
                name: "teamSchedule",
                list: TeamScheduleList,
                meta: {
                  canDelete: false,
                  label: "Team Schedule"
                },
              },
              {
                name: "WFH Request",
                list: "/wfhform",
                create: "/wfhform",
                edit: "/wfhform",
                show: "/wfhform",
                meta: {
                  canDelete: false,
                  label: "Apply for WFH"
                },
              },
            ]}
            options={{
              syncWithLocation: true,
              warnWhenUnsavedChanges: true,
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
                    Title={CustomTitle}
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
                <Route path="/schedule" >
                  <Route index element={<ScheduleList />} />
                </Route>
                <Route path="/teamSchedule" >
                  <Route index element={<TeamScheduleList />} />
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
