import type { CollectionEntry, CollectionKey } from "astro:content";

export interface GlobalWarSuppliesInstance {
    id: number;
    name: string;
    amount: number;
    inventory: number;
    multiplier: number;
}

export interface WarSuppliesInstance {
    warSupply: CollectionEntry<"warsupplies">;
    amount: number;
    inventory: number;
    crafter: CollectionEntry<"crafters">["id"];
}

export interface ComponentCounter {
    component: CollectionEntry<"components">;
    amount: number;
}

export function getCollectionItem<C extends CollectionKey, E extends Omit<CollectionEntry<C>, "data">>(id: string, collection: E[]): E | undefined {
    return collection.find(item => item.id === id);
}

export function getCollectionItemForce<C extends CollectionKey, E extends Omit<CollectionEntry<C>, "data">>(id: string, collection: E[]): E {
    const result = getCollectionItem(id, collection);
    if (result === undefined) {
        throw Error("Item in collection does not exist!");
    }
    return result;
}

export function getWarSupplyCount(counter: WarSuppliesInstance, globalCounters: GlobalWarSuppliesInstance[]) {
    let amount = counter.amount;
    for (const globalCounter of globalCounters) {
        amount += globalCounter.multiplier * (globalCounter.amount - globalCounter.inventory);
    }
    return Math.max(0, amount - counter.inventory);
}