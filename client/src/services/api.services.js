import {serviceAxiosInstance, serviceAxiosInstanceForFileUpload} from "./config"

export const userSignUp = async (data) => {
    const response = await serviceAxiosInstance.post("/user/signup", data);
    return response;
}

export const userLogin = async (data) => {
    const response = await serviceAxiosInstance.post("/user/login", data);
    return response;
}

//logout
export const userLogout = async () => {
     const response = await serviceAxiosInstance("/user/logout");
     return response;
}

export const verifyEmail = async (data) => {
    const response = await serviceAxiosInstance.post("/user/verify", data);
    return response;
}

//get-userBy-id
export const fetchUserProfile = async (userId) => {
    const response = await serviceAxiosInstance.get(`/userprofile/profile/${userId}`);
    return response;
}

//edit-user-profile-pic
export const editProfilePic = async (file) => {
    const data = new FormData();
    data.append("profilePicture", file);
    const response = await serviceAxiosInstanceForFileUpload.patch(`/userprofile/uploadpfp`, data);
    return response;
}

//edit-userProfile-data
export const editProfileData = async (data) => {
    const response = await serviceAxiosInstance.put(`/userprofile/profile`, data);
    return response;
}

//get-suggested-peers
export const fetchSuggestedPeers = async (page=1) => {
    const response = await serviceAxiosInstance.get(`/peers/suggestedpeers`)
    return response;
}

//send-connection-request
export const sendConnectionToPeers = async (receiverId) => {
    const response = await serviceAxiosInstance.post("/peers/sendrequest", receiverId);
    return response;
}

export const getIncomingFriendRequests = async () => {
    const response = await serviceAxiosInstance.get("/peers/incoming-request");
    return response;
}
//get sent friend requests
export const fetchSendRequests = async () => {
    const response = await serviceAxiosInstance.get("/peers/sent-request");
    return response;
}

//accept friend request
export const acceptFriendRequest = async (data) => {
    const response = await serviceAxiosInstance.put("/peers/acceptrequest", data);
    return response;
}

//reject-friend-request
export const rejectFriendRequest = async (data) => {
    const response = await serviceAxiosInstance.patch("/peers/reject-request", data);
    return response;
}

//cancel-sent-request
export const cancelSentRequest = async (data) => {
    const response = await serviceAxiosInstance.patch("/peers/cancel-sent-request", data);
    return response;
}
