import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditTitleModalProps {
  isOpen: boolean;
  initialTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

export function EditTitleModal({ isOpen, initialTitle, onSave, onCancel }: EditTitleModalProps) {
  const [title, setTitle] = useState(initialTitle);

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Chat Title</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSave(title);
              }
            }}
            placeholder="Enter chat title..."
            className="w-full"
          />
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={() => onSave(title)}
            className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationModal({ isOpen, onConfirm, onCancel }: DeleteConfirmationModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Delete Chat</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this chat? This action cannot be undone.
          </p>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-gradient-to-r from-red-400 to-pink-400 hover:from-red-500 hover:to-pink-500"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
