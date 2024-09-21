import { AuthPage } from "@refinedev/antd";

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
          <div>
            {title}
            <h1 style={{ textAlign: "center" }}> WFH Portal</h1>
            {content}
          </div>
        );
      }}
    />
  );
};

export default Login;
