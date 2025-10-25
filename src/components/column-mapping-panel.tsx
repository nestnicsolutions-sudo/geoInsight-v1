import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

export default function ColumnMappingPanel() {
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
                Map your data columns to visual properties.
            </p>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Latitude</Label>
                    <Select disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select latitude column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lat">lat</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Longitude</Label>
                    <Select disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select longitude column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="lon">lon</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Separator />

                <div className="space-y-2">
                    <Label>Value / Metric (Optional)</Label>
                    <Select disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select value column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="value">value</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Category (Optional)</Label>
                    <Select disabled>
                        <SelectTrigger>
                            <SelectValue placeholder="Select category column" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="category">category</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    )
}
