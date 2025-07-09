import { addMemberToGroup, fetchConnections } from '@/services/api.services';
import { Dialog, DialogTitle } from '@radix-ui/react-dialog';
import React, { useEffect, useState } from 'react'
import { DialogContent, DialogDescription, DialogFooter, DialogHeader } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { UserPlus } from 'lucide-react';
import toast from "react-hot-toast";

const AddMemberDialog = ({open, setOpen, groupId}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [connections, setConnections] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleFetchConnections = async () => {
            try {
                const response = await fetchConnections();
                if(response?.status === 200){
                    setConnections(response?.data.payload.friends || []);
                }
            } catch (error) {
                console.error("Error Fetching connections", error.message);
            }
        }
        if(open){
            handleFetchConnections();
        }
    },[open]);

    const filteredConnections = connections.filter(connection => connection.user.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    console.log("FilterConnection", filteredConnections)

    const handleAddMember = async(userId) => {
         setIsLoading(true);
         try{
           const response = await addMemberToGroup({
              joinKarnewalaKaID: userId,
              groupId
           });
           if(response?.status === 200){
              toast.success("Member added successfully");
              setOpen(false);
           }
         }catch(error){
              console.error(error);
              toast.error(error.response?.data.message || "Failed to add Member");
         }finally {
            setIsLoading(false);
         }
    };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-slate-800 text-white border-slate-700 max-w-md">
         <DialogHeader>
            <DialogTitle>
                Add Members
            </DialogTitle>
            <DialogDescription className="text-slate-400">
                Invite your conections to join this study group
            </DialogDescription>
         </DialogHeader>

         <div className='space-y-4'>
         <div className="space-y-2">
          <Label htmlFor="search">Search Connections</Label>
          <Input
            id="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Type a name..."
            className=" bg-slate-700 border-slate-600 focus-visible:ring-teal-500 text-white"
          />
         </div>
          <ScrollArea className="h-[300px] pr-4">
           <div className='space-y-2'>
              {filteredConnections.length > 0 ? (
                 filteredConnections.map((connection) => (
                    <div key={connection.user._id} className='flex items-center justify-between p-2 rounded-md hover:bg-slate-700'>
                          <div className='flex item-center gap-3'>
                           <Avatar className="h-10 w-10">
                           {
                            connection.user.profilePicture ? (
                                <AvatarImage src={connection.user.profilePicture.url}></AvatarImage>
                            ) : (
                                 <AvatarFallback className="bg-slate-700 text-teal-300">
                            {connection.user.username?.substring(0, 2).toUpperCase() || "?"}
                          </AvatarFallback>
                            )
                           }
                           </Avatar>
                           <div>
                            <p className='font-medium text-slate-200'>{connection.user.username}</p>
                           </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleAddMember(connection.user._id)}
                            disabled={isLoading}
                            className="bg-teal-600 hover:bg-teal-700"
                          >
                            <UserPlus className="mr-1 h-4 w-4" />
                            {isLoading ? "Adding..." : "Add"}
                          </Button>
                    </div>
                 ))
              ) : (
                <p className="text-center text-slate-400 py-4">
                  {searchQuery ? "No connections match your search" : "No connections found"}
                </p>
              )}
           </div>
          </ScrollArea>
         </div>
          <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setOpen(false)}
            className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            Close
          </Button>
        </DialogFooter>
        </DialogContent>
    </Dialog>
  )
}

export default AddMemberDialog