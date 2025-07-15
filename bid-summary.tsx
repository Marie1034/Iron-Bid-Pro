import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, Printer, Share, Trash2 } from "lucide-react";

interface BidSummaryProps {
  subtotal: number;
  materials: number;
  labor: number;
  overhead: number;
  total: number;
  onSave: () => void;
  onPrint: () => void;
  onShare: () => void;
  onClear: () => void;
  isSaving: boolean;
}

export function BidSummary({
  subtotal,
  materials,
  labor,
  overhead,
  total,
  onSave,
  onPrint,
  onShare,
  onClear,
  isSaving,
}: BidSummaryProps) {
  return (
    <div className="space-y-6">
      {/* Total Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-secondary">
            Bid Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-secondary">Subtotal:</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Materials:</span>
              <span className="font-medium">${materials.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Labor:</span>
              <span className="font-medium">${labor.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Overhead:</span>
              <span className="font-medium">${overhead.toFixed(2)}</span>
            </div>
            <hr className="border-gray-200" />
            <div className="flex justify-between text-lg font-semibold text-secondary">
              <span>Total Bid:</span>
              <span className="text-primary">${total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-medium text-secondary">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="w-full bg-primary hover:bg-primary-dark"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : "Save Bid"}
            </Button>
            <Button
              onClick={onPrint}
              variant="outline"
              className="w-full"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print Summary
            </Button>
            <Button
              onClick={onShare}
              variant="outline"
              className="w-full"
            >
              <Share className="w-4 h-4 mr-2" />
              Share Bid
            </Button>
            <Button
              onClick={onClear}
              variant="outline"
              className="w-full"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
