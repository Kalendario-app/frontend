import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateAccount } from "./CreateAccount";

test("if the user type a password that contain an uppercase, the uppercase detector trigger", () => {
    render(<CreateAccount />);
    userEvent.type(screen.getByPlaceholderText("Choose a password"), "A");

    expect(screen.getByText("Password must contain an uppercase").style).toHaveProperty("color", "rgb(91, 169, 76)");
});
test("if the user type a password that contain a lowercase, the lowercase detector trigger", () => {
    render(<CreateAccount />);
    userEvent.type(screen.getByPlaceholderText("Choose a password"), "a");

    expect(screen.getByText("Password must contain a lowercase").style).toHaveProperty("color", "rgb(91, 169, 76)");
});
test("if the user type a password that contain a symbol, the symbol detector trigger", () => {
    render(<CreateAccount />);
    userEvent.type(screen.getByPlaceholderText("Choose a password"), "@");

    expect(screen.getByText("Password must contain a special symbol").style).toHaveProperty("color", "rgb(91, 169, 76)");
});
test("if the user type a password that contain a number, the number detector trigger", () => {
    render(<CreateAccount />);
    userEvent.type(screen.getByPlaceholderText("Choose a password"), "7");

    expect(screen.getByText("Password must contain a number").style).toHaveProperty("color", "rgb(91, 169, 76)");
});
test("if the user type a password that contain at least 8 charactere, the long pass detector trigger", () => {
    render(<CreateAccount />);
    userEvent.type(screen.getByPlaceholderText("Choose a password"), "12345678");

    expect(screen.getByText("Password must contain at least 8 charactere").style).toHaveProperty("color", "rgb(91, 169, 76)");
});
