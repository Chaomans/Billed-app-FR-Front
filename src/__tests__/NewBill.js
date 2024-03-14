/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then should track when a file is selected", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn();
      const store = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      newBill.handleChangeFile = jest.fn((e) => {
        e.preventDefault();
      });
      const inp = screen.getByTestId("file");
      const file = new File(["blob"], "myImage.png", { type: "image/png" });
      await waitFor(() =>
        fireEvent.change(inp, {
          target: { files: [file] },
        })
      );
      expect(inp.files[0].name).toBe("myImage.png");
      expect(inp.files.length).toBe(1);
      expect().toHaveBeenCalledTimes(1);
    });
    test("Then should notify user when an invalid file is selected", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn();
      const store = jest.fn();

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      const inp = screen.getByTestId("file");
      const file = new File(["blob"], "myImage.gif", { type: "image/gif" });
      await waitFor(() =>
        fireEvent.change(inp, {
          target: { files: [file] },
        })
      );
      expect(inp.files[0].name).toBe("myImage.gif");
      expect(inp.files.length).toBe(1);
      expect(inp.classList.contains("is-invalid")).toBeTruthy();
    });
  });
});
