import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  status: false,
  peers: [],
  members: [],
  
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

    setMembers: (state, action) => {
      state.members = action.payload;
    }
    
  },
});
export const { setAuthUser,setStatus, setPeers, setMembers} = authSlice.actions;
export default authSlice.reducer;