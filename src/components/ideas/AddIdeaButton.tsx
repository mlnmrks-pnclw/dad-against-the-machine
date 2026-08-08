"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { IdeaForm } from "@/components/ideas/IdeaForm";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useContentStore } from "@/lib/store/content-store";

export function AddIdeaButton({
  size = "md",
  label = "Add Idea",
  openCreator = false,
}: {
  size?: "sm" | "md" | "lg";
  label?: string;
  openCreator?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { createIdea } = useContentStore();
  const router = useRouter();

  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        {label}
      </Button>
      <Modal open={open} title="Add idea" onClose={() => setOpen(false)}>
        <IdeaForm
          submitLabel="Create idea"
          onCancel={() => setOpen(false)}
          onSubmit={(input) => {
            const idea = createIdea(input);
            setOpen(false);
            if (openCreator) {
              router.push(`/ideas/${idea.id}`);
            }
          }}
        />
      </Modal>
    </>
  );
}
