/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import storeMock from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  // afterAll(() => jest.restoreAllMocks());
  describe("When I am on NewBill Page", () => {
    test("Then should accept a valid file to be selected", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn();
      const store = storeMock;
      localStorageMock.clear();
      const localStorageMocked = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation((key) => localStorageMock.getItem(key));
      localStorageMock.setItem(
        "user",
        JSON.stringify({ email: "mail@test.com" })
      );
      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      const inp = screen.getByTestId("file");
      const file = new File(["blob"], "myImage.png", { type: "image/png" });
      expect(inp.files.length).toBe(0);
      await userEvent.upload(inp, file);
      expect(inp.files.length).toBe(1);
      expect(inp.files[0]).toBe(file);
      expect(localStorageMocked).toHaveBeenCalled();
      expect(inp.classList.contains("is-invalid")).not.toBeTruthy();
    });

    test("Then should notify user when an invalid file is selected", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn();
      const store = storeMock;

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

    test("Then should submit a new bill properly", async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = jest.fn(() => {});
      const store = storeMock;

      localStorageMock.clear();
      const localStorageMocked = jest
        .spyOn(Storage.prototype, "getItem")
        .mockImplementation((key) => localStorageMock.getItem(key));
      localStorageMock.setItem(
        "user",
        JSON.stringify({ email: "mail@test.com" })
      );

      screen.getByTestId("datepicker").value = "2024-01-01";
      screen.getByTestId("pct").value = 15;

      const newBill = new NewBill({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      const submit = jest.fn(newBill.handleSubmit);
      const inp = screen.getByTestId("file");
      const file = new File(["blob"], "myImage.png", { type: "image/png" });
      expect(inp.files.length).toBe(0);
      screen.getByTestId("form-new-bill").addEventListener("submit", submit);
      await userEvent.upload(inp, file);
      await userEvent.click(screen.getByTestId("submit"));
      expect(submit).toHaveBeenCalled();
      expect(onNavigate).toHaveBeenCalled();
    });
  });
});
