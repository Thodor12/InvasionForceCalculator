import { createSlice, type CaseReducer, type PayloadAction } from "@reduxjs/toolkit";
import { getCollectionItem, getCollectionItemForce, getWarSupplyCount, type GlobalWarSuppliesInstance, type WarSuppliesInstance } from "./utils";
import type { CollectionEntry } from "astro:content";

export interface State {
    crafters: Array<CollectionEntry<"crafters">>;
    gatherers: Array<CollectionEntry<"gatherers">>;
    recipes: Array<CollectionEntry<"recipes">>;
    warSupplies: Array<CollectionEntry<"warsupplies">>;
    components: Array<CollectionEntry<"components">>;
    materials: Array<CollectionEntry<"materials">>;
    globalCounters: GlobalWarSuppliesInstance[];
    counters: WarSuppliesInstance[];

    calculatedComponents: CalculatedComponents;
    calculatedMaterials: CalculatedMaterials;
}

export interface SetGlobalWarSupplyAmountsAction {
    id: number;
    amount: number;
    inventory: number;
}

export interface SetWarSupplyAmountsAction {
    warSupply: CollectionEntry<"warsupplies">;
    amount: number;
    inventory: number;
}

export interface SetWarSupplyCrafterAction {
    warSupply: CollectionEntry<"warsupplies">;
    crafter: string;
}

export interface SetComponentAmountAction {
    component: CollectionEntry<"components">;
    inventory: number;
}

export interface SetMaterialAmountAction {
    material: CollectionEntry<"materials">;
    inventory: number;
}

type Reducer = {
    setGlobalWarSupplyAmounts: CaseReducer<State, PayloadAction<SetGlobalWarSupplyAmountsAction>>;
    setWarSupplyAmounts: CaseReducer<State, PayloadAction<SetWarSupplyAmountsAction>>;
    setWarSupplyCrafter: CaseReducer<State, PayloadAction<SetWarSupplyCrafterAction>>;
    setComponentAmount: CaseReducer<State, PayloadAction<SetComponentAmountAction>>;
    setMaterialAmount: CaseReducer<State, PayloadAction<SetMaterialAmountAction>>;
};

type CalculatedComponents = {
    [key: string]: {
        component: CollectionEntry<"components">;
        amount: number;
        inventory: number;
    };
};

type CalculatedMaterials = {
    [key: string]: {
        material: CollectionEntry<"materials">;
        amount: number;
        inventory: number;
    };
};

function calculateComponents(state: State) {
    return state.counters.reduce<CalculatedComponents>((prev, curr) => {
        const recipesForWarSupply = state.recipes.filter(
            (f) =>
                f.data.type.id === curr.warSupply.id &&
                f.data.crafter.id === curr.crafter
        );

        for (const recipe of recipesForWarSupply) {
            for (const input of recipe.data.inputs) {
                if (prev[input.component.id] === undefined) {
                    prev[input.component.id] = {
                        component: getCollectionItemForce(input.component.id, state.components),
                        amount: 0,
                        inventory: 0
                    };
                }
                prev[input.component.id].amount += input.amount * Math.ceil(getWarSupplyCount(curr, state.globalCounters) / recipe.data.amount);
            }
        }
        return prev;
    }, {});
}

function calculateMaterials(state: State) {
    return Object.values(state.calculatedComponents).reduce<CalculatedMaterials>((prev, curr) => {
        for (const material of curr.component.data.materials) {
            if (prev[material.material.id] === undefined) {
                prev[material.material.id] = {
                    material: getCollectionItemForce(material.material.id, state.materials),
                    amount: 0,
                    inventory: 0,
                };
            }
            prev[material.material.id].amount += material.amount * (curr.amount - curr.inventory);
        }
        return prev;
    }, {});
}

export const calculatorReducer = createSlice<State, Reducer>({
    name: "calculator",
    initialState: {
        crafters: [],
        gatherers: [],
        recipes: [],
        warSupplies: [],
        components: [],
        materials: [],
        globalCounters: [],
        counters: [],
        calculatedComponents: {},
        calculatedMaterials: {}
    },
    reducers: {
        setGlobalWarSupplyAmounts: (state, action) => {
            const globalCounter = state.globalCounters.find(f => f.id === action.payload.id);
            if (globalCounter) {
                globalCounter.amount = action.payload.amount;
                globalCounter.inventory = action.payload.inventory;
            }

            state.calculatedComponents = calculateComponents(state);
            state.calculatedMaterials = calculateMaterials(state);
        },
        setWarSupplyAmounts: (state, action) => {
            const counter = state.counters.find(f => f.warSupply.id === action.payload.warSupply.id);
            if (counter) {
                counter.amount = action.payload.amount;
                counter.inventory = action.payload.inventory;
            }

            state.calculatedComponents = calculateComponents(state);
            state.calculatedMaterials = calculateMaterials(state);
        },
        setWarSupplyCrafter: (state, action) => {
            const counter = state.counters.find(f => f.warSupply.id === action.payload.warSupply.id);
            if (!counter) {
                return;
            }

            const crafter = getCollectionItem(action.payload.crafter, counter.warSupply.data.crafters);
            if (!crafter) {
                return;
            }

            counter.crafter = crafter.id;
            state.calculatedComponents = calculateComponents(state);
            state.calculatedMaterials = calculateMaterials(state);
        },
        setComponentAmount: (state, action) => {
            const counter = state.calculatedComponents[action.payload.component.id];
            if (!counter) {
                return;
            }

            counter.inventory = action.payload.inventory;
            state.calculatedMaterials = calculateMaterials(state);
        },
        setMaterialAmount: (state, action) => {
            const counter = state.calculatedMaterials[action.payload.material.id];
            if (!counter) {
                return;
            }

            counter.inventory = action.payload.inventory;
        }
    },
});
