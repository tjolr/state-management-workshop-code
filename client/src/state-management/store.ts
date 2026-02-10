import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import { apiSlice } from "./server-state/api/apiSlice";
import themeReducer from "./client-state/theme/themeSlice";
import filterReducer from "./client-state/filters/filterSlice";
import sortingReducer from "./client-state/sorting/sortingSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    filters: filterReducer,
    sorting: sortingReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
