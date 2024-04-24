import type { AnyAction } from "@reduxjs/toolkit";
import { Input } from "./Input";
import type { GlobalWarSuppliesInstance } from "./utils";
import { useCallback } from "react";
import { calculatorReducer } from "./reducer";

interface Props {
  globalCounter: GlobalWarSuppliesInstance;
  dispatch: React.Dispatch<AnyAction>;
}

export function GlobalCounter({ globalCounter, dispatch }: Props) {
  const updateAmount = useCallback((amount: string) => {
    dispatch(calculatorReducer.actions.setGlobalWarSupplyAmounts({
      id: globalCounter.id,
      amount: isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10),
      inventory: globalCounter.inventory,
    }))
  }, [globalCounter, dispatch]);

  const updateInventory = useCallback((amount: string) => {
    dispatch(calculatorReducer.actions.setGlobalWarSupplyAmounts({
      id: globalCounter.id,
      amount: globalCounter.amount,
      inventory: isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10),
    }))
  }, [globalCounter, dispatch]);

  return (
    <tr>
      <td>{globalCounter.name}</td>
      <td>
        <Input
          value={globalCounter.amount}
          onChange={(event) => updateAmount(event.target.value)}
          type="number"
          fullWidth
        />
      </td>
      <td>
        <Input
          value={globalCounter.inventory}
          onChange={(event) => updateInventory(event.target.value)}
          type="number"
          fullWidth
        />
      </td>
      <td>
        <p>{Math.max(0, globalCounter.amount - globalCounter.inventory)}</p>
      </td>
      <td></td>
      <td></td>
    </tr>
  )
}