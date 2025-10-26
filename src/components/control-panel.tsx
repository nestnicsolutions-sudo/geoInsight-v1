import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import FileUploadPanel from "./file-upload-panel"
import ColumnMappingPanel from "./column-mapping-panel"
import LayerListPanel from "./layer-list-panel"
import SmartLayerSuggestionsPanel from "./smart-layer-suggestions-panel"

export default function ControlPanel() {
    return (
        <div className="h-full">
            <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-base font-medium">1. Upload Data</AccordionTrigger>
                    <AccordionContent>
                        <FileUploadPanel />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                    <AccordionTrigger className="text-base font-medium">2. Map Columns</AccordionTrigger>
                    <AccordionContent>
                        <ColumnMappingPanel />
                    </AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                    <AccordionTrigger className="text-base font-medium">3. Add Layers</AccordionTrigger>
                    <AccordionContent>
                        <SmartLayerSuggestionsPanel />
                        <LayerListPanel />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
