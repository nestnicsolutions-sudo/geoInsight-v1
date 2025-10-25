import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useStore } from "@/lib/store";

export default function ColumnMappingPanel() {
    const { columns, mappedColumns, setMappedColumns, data } = useStore();
    const hasData = data.length > 0;

    const handleSelectChange = (field: 'latitude' | 'longitude' | 'value' | 'category') => (value: string) => {
        setMappedColumns({ [field]: value === "none" ? null : value });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Map your data columns to visual properties.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Select onValueChange={handleSelectChange('latitude')} value={mappedColumns.latitude || ''} disabled={!hasData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select latitude column" />
                        </SelectTrigger>
                        <SelectContent>
                            {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Longitude</Label>
                     <Select onValueChange={handleSelectChange('longitude')} value={mappedColumns.longitude || ''} disabled={!hasData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select longitude column" />
                        </SelectTrigger>
                        <SelectContent>
                           {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label>Value / Metric (Optional)</Label>
                    <Select onValueChange={handleSelectChange('value')} value={mappedColumns.value || 'none'} disabled={!hasData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select value column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                           {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select onValueChange={handleSelectChange('category')} value={mappedColumns.category || 'none'} disabled={!hasData}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">None</SelectItem>
                            {columns.map(col => <SelectItem key={col} value={col}>{col}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
