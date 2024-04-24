import { GridToolbar, type GridColDef, DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro";
import { calculatorReducer, type State } from "./reducer";
import { useCallback, useMemo, type Dispatch } from "react";
import { getCollectionItemForce } from "./utils";
import { Input } from "./Input";
import type { AnyAction } from "@reduxjs/toolkit";

interface Props {
    state: State;
    dispatch: Dispatch<AnyAction>;
}

export function ComponentsGrid({ state, dispatch }: Props) {
    const ref = useGridApiRef();

    const columns = useMemo<GridColDef<State["calculatedComponents"][""]>[]>(() => ([
        {
            type: "singleSelect",
            field: "crafting_skill",
            headerName: "Crafting Skill",
            minWidth: 150,
            valueGetter: params => getCollectionItemForce(params.row.component.data.crafter.id, state.crafters).data.name,
            valueOptions: state.crafters.map(m => m.data.name),
        },
        {
            type: "singleSelect",
            field: "component",
            headerName: "Component",
            minWidth: 150,
            sortable: false,
            valueGetter: params => params.row.component.data.name,
            valueOptions: state.components.map(m => m.data.name)
        },
        {
            type: "number",
            field: "inventory",
            headerName: "In Inventory",
            minWidth: 150,
            sortable: false,
            renderCell: params => <Input value={params.row.inventory} onChange={event => dispatch(calculatorReducer.actions.setComponentAmount({
                component: params.row.component,
                inventory: isNaN(parseInt(event.target.value, 10)) ? 0 : parseInt(event.target.value, 10),
            }))} />
        },
        {
            type: "number",
            field: "total",
            headerName: "Total Amount",
            flex: 1,
            valueGetter: params => Math.max(0, params.row.amount - params.row.inventory),
            headerAlign: "right",
            align: "right"
        }
    ]), [state]);

    const rows = useMemo(() => Object.values(state.calculatedComponents).filter(component => component.amount > 0), [state.calculatedComponents]);

    const resize = useCallback(() => {
        if (ref.current.autosizeColumns) {
            ref.current.autosizeColumns();
        }
    }, [ref]);

    return (
        <DataGridPro
            apiRef={ref}
            columns={columns}
            rows={rows}
            autoHeight
            className="mt-5"
            getRowId={row => row.component.id}
            autosizeOnMount
            disableRowSelectionOnClick
            disableColumnSelector
            disableDensitySelector
            disableColumnPinning
            onStateChange={resize}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
                toolbar: {
                    showQuickFilter: true,
                },
            }}
            initialState={{
                sorting: {
                    sortModel: [
                        {
                            field: "crafting_skill",
                            sort: "asc",
                        }
                    ]
                }
            }}
        />
    )
}