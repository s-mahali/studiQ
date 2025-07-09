import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { createGroup } from "@/services/api.services";
import toast from "react-hot-toast";
import { Loader2, X } from "lucide-react";

export function CreateGroup({ setOpen, open }) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [data, setData] = useState({
    title: "",
    description: "",
    coverImage: "",
  });
  const imageRef = useRef(null);
  const fileChangeHandler = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setData((prev) => ({ ...prev, coverImage: file }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    if (imageRef.current) {
      imageRef.current.value = "";
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    try {
      if (!data.title.trim() ) {
        toast.error("Group title is required");
        return;
      }
      setIsLoading(true);
      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      if (data.coverImage) formData.append("coverImage", data.coverImage);

      const response = await createGroup(formData);
      if (response?.data?.success) {
        toast.success(response.data.message);
        setOpen(false);
        setData({
          title: "",
          description: "",
          coverImage: "",
        });
        setImageFile(null);
        setImagePreview("");
      }
    } catch (error) {
      console.error(error.message);
      toast.error(error.response?.data.message || "Failed to create Group");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={() => setOpen(false)}
      >
        <DialogHeader>
          <DialogTitle>Create Group</DialogTitle>
          <DialogDescription>
            Create a group to study together with your friends.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateGroup}>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                required
                placeholder="The Ogs"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Description</Label>
              <Input
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                required
                placeholder="A small Group Description (less than 30 words)"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coverImage">CoverImage</Label>
              <Input
                name="coverImage"
                type="file"
                ref={imageRef}
                onChange={fileChangeHandler}
                accept="image/*"
                required
              />
            </div>
            {imagePreview && (
              <div className="relative mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-40 object-cover rounded-md border border-gray-300"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className={"absolute top-2 right-2 h-6 w-6 rounded-full"}
                  onClick={removeImage}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <DialogFooter className={"mt-4"}>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !data.title.trim() || !data.description || !data.coverImage} className="cursor-pointer">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Create Group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default CreateGroup;
