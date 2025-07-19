import Groupchat from "@/components/group/groupchat/Groupchat";
import Studyzone from "@/components/studyzone/Studyzone";
import { setCurrentGroupId, setGroups } from "@/redux/slicers/groupSlice";
import { fetchUserJoinedGroup } from "@/services/api.services";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate, useParams } from "react-router-dom";

const CurrentGroupPage = () => {
  const { userGroups } = useSelector((store) => store.group);
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { groupId } = useParams();
  
  useEffect(() => {
     let isRedirecting = false;
    const fetchGroups = async () => {
     
      try {
        const res = await fetchUserJoinedGroup();
        if (res?.status === 200) {
          dispatch(setGroups(res?.data.payload));
          if (!groupId && res?.data.payload.length > 0) {
            isRedirecting = true; // prevent further redirects
            navigate(`/study-zone/${res?.data.payload[0]?._id}`);
            //optional
            dispatch(setCurrentGroupId(res?.data.payload[0]?._id));
          }
        }
      } catch (error) {
        console.error("error fetching groups", error?.message);
      }
    };

    fetchGroups();
  }, [user?._id, dispatch, navigate, user]);
  return (
    <>
      <Outlet/>
    </>
  );
};

export default CurrentGroupPage;
