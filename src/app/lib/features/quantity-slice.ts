import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialState = {
    value: {
        quantity: number
    }
}

const initialState = {
    value: {
        quantity: 1
    }
} as InitialState

export const quantity = createSlice({
    name: 'quantity',
    initialState: initialState,
    reducers: {
        increase: (state) => {
            if (state.value.quantity < 8) {
                return {
                    value: {
                        quantity: state.value.quantity + 1
                    }
                }
            } else {
                return {
                    value: {
                        quantity: state.value.quantity
                    }
                }
            }
        },
        decrease: (state) => {
            if (state.value.quantity > 1) {
                return {
                    value: {
                        quantity: state.value.quantity - 1
                    }
                }
            } else {
                return {
                    value: {
                        quantity: state.value.quantity
                    }
                }
            }
        }
    }
})

export const { increase, decrease } = quantity.actions;
export default quantity.reducer;