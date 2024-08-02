import { createSlice, PayloadAction } from "@reduxjs/toolkit"

type InitialState = {
    value: AccessTokenState
}

type AccessTokenState = {
    access_token: string
}

const initialState = {
    value: {
        access_token: ""
    } as AccessTokenState
} as InitialState

export const access_token = createSlice({
    name: 'access_token',
    initialState: initialState,
    reducers: {
        addAccessToken: (state, action: PayloadAction<AccessTokenState>) => {
            return {
                value: action.payload
            }
        },
        deleteAccessToken: () => {
            return initialState
        }
    }
})

export const { addAccessToken, deleteAccessToken } = access_token.actions;
export default access_token.reducer;