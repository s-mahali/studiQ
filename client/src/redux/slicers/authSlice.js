import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: false,
  
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
      state.status = true;
    },
    setStatus: (state) => {
      state.status = false;
    },
    
  },
});
export const { setAuthUser,setStatus} = authSlice.actions;
export default authSlice.reducer;