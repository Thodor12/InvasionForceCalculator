import type { CollectionEntry } from "astro:content";
import { Counter } from "./Counter.tsx";
import { GlobalCounter } from "./GlobalCounter.tsx";
import {
  type GlobalWarSuppliesInstance,
  type WarSuppliesInstance,
} from "./utils";
import { useReducer } from "react";
import { calculatorReducer, type State } from "./reducer.ts";
import { ComponentsGrid } from "./ComponentsGrid.tsx";
import { MaterialsGrid } from "./MaterialsGrid.tsx";
import { createTheme, ThemeProvider } from "@mui/material";
import { LicenseInfo } from "@mui/x-data-grid-pro";

LicenseInfo.setLicenseKey("1655ae4748b8a9e1b13711e2c02d09b5Tz0yMDIzMDEwMSxFPTI1MzM3MDc2NDgwMDAwMCxTPXBybyxMTT1hbm51YWwsS1Y9Mg==");

interface Props {
  crafters: Array<CollectionEntry<"crafters">>;
  gatherers: Array<CollectionEntry<"gatherers">>;
  recipes: Array<CollectionEntry<"recipes">>;
  warSupplies: Array<CollectionEntry<"warsupplies">>;
  components: Array<CollectionEntry<"components">>;
  materials: Array<CollectionEntry<"materials">>;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function createWarSupplyState({ crafters, gatherers, recipes, warSupplies, components, materials }: Props): State {
  const invasionForces: GlobalWarSuppliesInstance = {
    id: 1,
    name: "Invasion Forces",
    amount: 0,
    inventory: 0,
    multiplier: 1
  };

  const counters = warSupplies.map<WarSuppliesInstance>(
    (warSupply) => {
      const foundCrafters = warSupply.data.crafters
        .map((m) => crafters.find((f) => f.id === m.id))
        .filter((f): f is CollectionEntry<"crafters"> => f !== undefined);
      return {
        warSupply,
        amount: 0,
        inventory: 0,
        crafter: foundCrafters[0].id,
        crafters: foundCrafters,
      };
    }
  );

  return {
    crafters,
    gatherers,
    recipes,
    warSupplies,
    components,
    materials,
    globalCounters: [invasionForces],
    counters,
    calculatedComponents: {},
    calculatedMaterials: {}
  }
}

export function Calculator(props: Props) {
  const [state, dispatch] = useReducer(calculatorReducer.reducer, createWarSupplyState(props));

  return (
    <ThemeProvider theme={darkTheme}>
      <div className="bg-zinc-700 p-5 rounded-lg">
        <h2 className="text-2xl">Settings</h2>
        <table className="table-auto border-collapse app-table">
          <tbody>
            <tr>
              <th></th>
              <th>Amount to Craft</th>
              <th>In Inventory</th>
              <th>Total to Craft</th>
              <th>Crafting Skill</th>
              <th>Note</th>
            </tr>
            {state.globalCounters.map(globalCounter => (
              <GlobalCounter
                key={`global_counter_${globalCounter.id}`}
                globalCounter={globalCounter}
                dispatch={dispatch}
              />
            ))}
            <tr>
              <td colSpan={6}><hr /></td>
            </tr>
            {state.counters.map(counter => (
              <Counter
                key={`counter_${counter.warSupply.id}`}
                state={state}
                counter={counter}
                dispatch={dispatch}
              />
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-zinc-700 p-5 rounded-lg">
        <h2 className="text-2xl">Components</h2>

        <ComponentsGrid state={state} dispatch={dispatch} />
      </div>

      <div className="bg-zinc-700 p-5 rounded-lg">
        <h2 className="text-2xl">Materials</h2>

        <MaterialsGrid state={state} dispatch={dispatch} />
      </div>
    </ThemeProvider>
  )
}