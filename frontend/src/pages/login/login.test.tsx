import Login from "./login";
import { render, screen } from "@/tests/testUtils";

describe("Login Component", () => {
  it("should load the components and styles", async () => {
    // Arrange
    render(<Login/>);
    const mainTitle = screen.getByText("SPM T7");
    const portalTitle = screen.getByText("WFH Portal");

    // Assert
    expect(mainTitle).toBeInTheDocument();
    expect(portalTitle).toBeInTheDocument();
    expect(portalTitle).toHaveStyle("text-align: center");
  });
});
