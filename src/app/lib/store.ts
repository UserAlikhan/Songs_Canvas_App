import { configureStore } from '@reduxjs/toolkit'
import selectedTrackReducer from './features/selected-track-slice'
import quantityReducer from './features/quantity-slice'
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import access_tokenReducer from './features/access_token-slice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            selectedTrackReducer,
            quantityReducer,
            access_tokenReducer
        }
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;