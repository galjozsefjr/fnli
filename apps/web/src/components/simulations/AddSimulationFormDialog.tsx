import { AddSimulationForm } from '@/components/simulations/AddSimulationForm';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PlusIcon, XIcon } from 'lucide-react';
import { type FC } from 'react';

export const AddSimulationFormDialog: FC = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="rounded-full cursor-pointer">
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl bg-white" showCloseButton={false}>
        <DialogHeader className="flex-row justify-between">
          <DialogTitle className="text-2xl">Add new simulation</DialogTitle>
          <DialogClose className="text-md" asChild>
            <Button variant="ghost" className="cursor-pointer"><XIcon /></Button>
          </DialogClose>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[75vh] overflow-y-auto px-4 py-4">
          <AddSimulationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};