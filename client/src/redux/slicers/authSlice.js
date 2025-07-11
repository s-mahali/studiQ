import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  peers: [],
  members: [],
  
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthUser: (state, action) => {
      state.user = action.payload;
      
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