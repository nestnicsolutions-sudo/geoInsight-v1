import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function LayerListPanel() {
    return (
        <div className="space-y-4">
             <p className="text-sm text-muted-foreground">
                Add and configure your visualization layers.
            </p>
            <Button variant="outline" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add Layer
            </Button>
            <div className="flex items-center justify-center h-24 text-sm border border-dashed rounded-lg bg-muted/20 text-muted-foreground">
                No layers added yet.
            </div>
        </div>
    )
}
