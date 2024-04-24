import {
  getCollectionItemForce,
  getWarSupplyCount,
  type WarSuppliesInstance,
} from "./utils.ts";
import { Input } from "./Input.tsx";
import type { AnyAction } from "@reduxjs/toolkit";
import { calculatorReducer, type State } from "./reducer.ts";
import { useCallback, useMemo } from "react";
import { MenuItem } from "@mui/material";

interface Props {
  counter: WarSuppliesInstance;
  state: State;
  dispatch: React.Dispatch<AnyAction>;
}

export function Counter({
  counter,
  state,
  dispatch,
}: Props) {
  const possibleCrafters = useMemo(
    () =>
      counter.warSupply.data.crafters
        .map((m) => getCollectionItemForce(m.id, state.crafters)),
    [counter]
  );

  const updateAmount = useCallback((amount: string) => {
    dispatch(calculatorReducer.actions.setWarSupplyAmounts({
      warSupply: counter.warSupply,
      amount: isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10),
      inventory: counter.inventory,
    }))
  }, [counter, dispatch]);

  const updateInventory = useCallback((amount: string) => {
    dispatch(calculatorReducer.actions.setWarSupplyAmounts({
      warSupply: counter.warSupply,
      amount: counter.amount,
      inventory: isNaN(parseInt(amount, 10)) ? 0 : parseInt(amount, 10),
    }))
  }, [counter, dispatch]);

  const updateCrafter = useCallback((id: string) => {
    dispatch(calculatorReducer.actions.setWarSupplyCrafter({
      warSupply: counter.warSupply,
      crafter: id
    }))
  }, [counter, dispatch]);

  return (
    <tr>
      <td>{counter.warSupply.data.name}</td>
      <td>
        <Input
          value={counter.amount}
          onChange={event => updateAmount(event.target.value)}
          type="number"
          fullWidth
        />
      </td>
      <td>
        <Input
          value={counter.inventory}
          onChange={event => updateInventory(event.target.value)}
          type="number"
          fullWidth
        />
      </td>
      <td>{getWarSupplyCount(counter, state.globalCounters)}</td>
      <td>
        <Input
          value={counter.crafter}
          onChange={event => updateCrafter(event.target.value)}
          select
          fullWidth
        >
          {possibleCrafters.map((crafter) => (
            <MenuItem key={`counter_${counter.warSupply.id}_option_${crafter.id}`} value={crafter.id}> {crafter.data.name}</MenuItem>
          ))}
        </Input>
      </td>
      {counter.warSupply.data.note ? (
        <td dangerouslySetInnerHTML={{ __html: counter.warSupply.data.note }} />
      ) : (
        <td></td>
      )}
    </tr>
  );
}
