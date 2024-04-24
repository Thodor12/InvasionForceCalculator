import { GridToolbar, type GridColDef, DataGridPro, useGridApiRef } from "@mui/x-data-grid-pro";
import { calculatorReducer, type State } from "./reducer";
import { useCallback, useMemo, type Dispatch } from "react";
import { getCollectionItemForce } from "./utils";
import type { AnyAction } from "@reduxjs/toolkit";
import { Input } from "./Input";

interface Props {
    state: State;
    dispatch: Dispatch<AnyAction>;
}

export function MaterialsGrid({ state, dispatch }: Props) {
    const ref = useGridApiRef();

    const columns = useMemo<GridColDef<State["calculatedMaterials"][""]>[]>(() => ([
        {
            type: "singleSelect",
            field: "gathering_skill",
            headerName: "Gathering Skill",
            minWidth: 150,
            valueGetter: params => getCollectionItemForce(params.row.material.data.gatherer.id, state.gatherers).data.name,
            valueOptions: state.gatherers.map(m => m.data.name)
        },
        {
            type: "singleSelect",
            field: "group",
            headerName: "Group",
            minWidth: 150,
            valueGetter: params => params.row.material.data.group,
            valueOptions: [...new Set(state.materials.map(m => m.data.group))]
        },
        {
            type: "singleSelect",
            field: "material",
            headerName: "Material",
            minWidth: 150,
            sortable: false,
            valueGetter: params => params.row.material.data.name,
            valueOptions: state.materials.map(m => m.data.name)
        },
        {
            type: "number",
            field: "grade",
            headerName: "Grade",
            minWidth: 150,
            valueGetter: params => params.row.material.data.grade,
            headerAlign: "left",
            align: "left"
        },
        {
            type: "number",
            field: "inventory",
            headerName: "In Inventory",
            minWidth: 150,
            sortable: false,
            renderCell: params => <Input value={params.row.inventory} onChange={event => dispatch(calculatorReducer.actions.setMaterialAmount({
                material: params.row.material,
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

    const rows = useMemo(() => Object.values(state.calculatedMaterials).filter(material => material.amount > 0), [state.calculatedMaterials]);

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
            getRowId={row => row.material.id}
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
                            field: "gathering_skill",
                            sort: "asc",
                        },
                        {
                            field: "grade",
                            sort: "desc"
                        }
                    ]
                }
            }}
        />
    )
}