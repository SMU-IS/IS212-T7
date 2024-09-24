import React from "react";
import { AuthPage } from "@refinedev/antd";
import { Box, Heading } from "@chakra-ui/react";

const Login = () => {
  return (
    <AuthPage
      type="login"
      registerLink={false}
      wrapperProps={{
        style: {
          background: "#131049",
          color: "white",
        },
      }}
      title="SPM T7"
      renderContent={(content: React.ReactNode, title: React.ReactNode) => {
        return (
          <Box>
            {title}
            <Heading style={{ textAlign: "center" }}> WFH Portal</Heading>
            {content}
          </Box>
        );
      }}
    />
  );
};

export default Login;