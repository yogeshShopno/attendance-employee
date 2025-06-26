// src/redux/slices/permissionsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import {
  savePermissions,
  getPermissions,
  clearPermissionsStorage,
} from './sessionStorageUtils';

const initialState = getPermissions() || {};

const permissionsSlice = createSlice({
  name: 'permissions',
  initialState,
  reducers: {
    setPermissions: (_, action) => {
      savePermissions(action.payload);
      return action.payload;
    },
    clearPermissions: () => {
      clearPermissionsStorage();
      return {};
    },
  },
});

export const { setPermissions, clearPermissions } = permissionsSlice.actions;
export default permissionsSlice.reducer;
