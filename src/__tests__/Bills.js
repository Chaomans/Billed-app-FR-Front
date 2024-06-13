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
import { formatDate } from "../app/format.js";

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
    test("Then bills should be ordered from earliest to latest", async () => {
      const onNavigate = jest.fn();
      const store = storeMock;
      const BillsInstance = new Bills({
        document,
        onNavigate,
        store,
        localStorageMock,
      });
      BillsInstance.store = storeMock;
      document.body.innerHTML = BillsUI({
        data: await BillsInstance.getBills(),
      });
      const dates = screen
        .getAllByText(
          // /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
          /^\d\d? ([A-Z][a-zé]{2}\.) (\d\d)$/i
        )
        .map((a) => a.innerHTML);
      const antiChrono = (a, b) => (Date.parse(a) < Date.parse(b) ? 1 : -1);
      const datesSorted = [...bills.map((b) => b.date)]
        .sort(antiChrono)
        .map((date) => formatDate(date));
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
