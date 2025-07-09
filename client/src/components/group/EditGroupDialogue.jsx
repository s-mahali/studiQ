import { updateGroup } from "@/services/api.services";
import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Loader2, X } from "lucide-react";

const EditGroupDialogue = ({ open, setOpen, groupId, groupData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [data, setData] = useState({
    title: "",
    description: "",
  });
  const imageRef = useRef(null);
  useEffect(() => {
    if (groupData) {
      setData({
        title: groupData.title || "",
        description: groupData.description || "",
      });
      if (groupData.coverImage?.url) {
        setImagePreview(groupData.coverImage.url);
      }
    }
  }, [groupData]);

  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!data.title.trim()) {
      toast.error("Group Title is required");
      return;
    }
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (imageFile) formData.append("coverImage", imageFile);
      const response = await updateGroup(formData, groupId);
      if (response?.status === 200) {
        console.log("update Group Done: ", response.data);
        toast.success("Group updated successfully");
        setOpen(false);
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data?.message || "Failed to update group");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Group</DialogTitle>
          <DialogDescription className="text-slate-400">
            Update your group details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              className="bg-slate-700 border-slate-600 focus-visible:ring-teal-500 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={data.description}
              onChange={(e) =>
                setData({ ...data, description: e.target.value })
              }
              className="bg-slate-700 border-slate-600 focus-visible:ring-teal-500 text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coverImage">CoverImage</Label>
            <Input
              id="coverImage"
              type="file"
              ref={imageRef}
              onChange={fileChangeHandler}
              className="bg-slate-700 border-slate-600 text-white"
            />
          </div>
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="imagePreview"
                className="w-full h-40 object-cover rounded-md"
              />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                onClick={removeImage}
              >
                <X size={16} />
              </Button>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !data.title.trim() || !imagePreview}
              className="bg-teal-600 hover:bg-teal-700 text-white"
            >
              {isLoading ? <Loader2 /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGroupDialogue;
