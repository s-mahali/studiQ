import GroupMembers from "@/components/group/groupchat/GroupMembers";
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userGroups: [],
    groupMembers: [],
    groupMessages: [],
    currentGroupId: "",
   
};

const groupSlice = createSlice({
        name: "group",
        initialState,
        reducers: {
            setGroups: (state, action) => {
                state.userGroups = action.payload;

            },
            setAddNewMessage: (state, action) => {
                state.groupMessages.push(action.payload);
            },
            setCurrentGroupId: (state, action) => {
                  state.currentGroupId = action.payload;
            },
            setGroupMembers: (state, action) => {
                state.groupMembers = action.payload;
            },
            setGroupMessage: (state, action) => {
                state.groupMessages = action.payload;
            },  
        },
})

export const {setGroups, setGroupMembers, setGroupMessage, setCurrentGroupId, setAddNewMessage} = groupSlice.actions;
export default groupSlice.reducer;