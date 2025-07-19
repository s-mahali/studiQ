import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    targetUser: null,
    onlineUsers: [],
    messages: [],
    notification: null,
}

const chatSlice = createSlice({
    name: "chat",
    initialState,
    reducers: {
        setTargetUser(state, action) {
            state.targetUser = action.payload;
        },
        setOnlineUsers(state, action) {
            state.onlineUsers = action.payload;
        },
        setMessages(state, action) {
            state.messages = action.payload;
        },
         setAddNewMessage: (state, action) => {
                        state.messages.push(action.payload);
                    },
       
        removeMessage(state){
            state.messages = [];
        },

        setNotification(state, action) {
            state.notification = action.payload;
        },

        removeNotification(state) {
            state.notification = null;
        },
        

       
    }
});

export const { setTargetUser, setOnlineUsers, setMessages, removeMessage, setAddNewMessage, setNotification, removeNotification } = chatSlice.actions;
export default chatSlice.reducer;