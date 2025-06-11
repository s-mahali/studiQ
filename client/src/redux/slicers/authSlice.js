import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: false,
  peers: []
  
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
    setPeers: (state, action) => {
       state.peers = action.payload;
    },
    
  },
});
export const { setAuthUser,setStatus, setPeers} = authSlice.actions;
export default authSlice.reducer;