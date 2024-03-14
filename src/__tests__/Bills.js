/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import {
  bills,
  corruptedBills,
  formattedBills,
  formattedCorruptedBills,
} from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import storeMock from "../__mocks__/store.js";
import Bills from "../containers/Bills.js";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
    });
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (a < b ? 1 : -1);
      const datesSorted = [...dates].sort(antiChrono);
      expect(dates).toEqual(datesSorted);
    });

    test("Then can request to create a new bill", async () => {
      document.body.innerHTML = BillsUI({ data: bills });

      // we have to mock navigation to test it
      const onNavigate = jest.fn();
      const store = jest.fn();
      const BillsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      fireEvent.click(screen.getByTestId("btn-new-bill"));
      expect(BillsInstance.onNavigate).toHaveBeenCalled();
    });

    test("Then should be able to trigger bills details modal opening", () => {
      // we have to mock navigation to test it
      const onNavigate = jest.fn();
      const store = jest.fn();

      document.body.innerHTML = BillsUI({ data: bills });
      const BillsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      BillsInstance.handleClickIconEye = jest.fn();
      fireEvent.click(screen.getAllByTestId("icon-eye")[0]);
      expect(BillsInstance.handleClickIconEye).toHaveBeenCalledTimes(1);
    });

    test("Then should retrieve the list of bills", async () => {
      const onNavigate = jest.fn();
      const store = jest.fn();

      const BillsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorageMock,
      });
      BillsInstance.store = storeMock;
      expect(await BillsInstance.getBills()).toEqual(formattedBills);
    });

    test("Then should retrieve bills with corrupted date", async () => {
      const onNavigate = jest.fn();
      const store = storeMock;

      store.bills().list = jest.fn(() => Promise.resolve(corruptedBills));

      const BillsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorageMock,
      });

      expect(await BillsInstance.getBills()).toEqual(formattedCorruptedBills);
    });
  });
});
