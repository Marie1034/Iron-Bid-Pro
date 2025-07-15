import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { predefinedItems } from "@shared/schema";

interface CalculatorItem {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface ItemCalculatorProps {
  items: CalculatorItem[];
  onQuantityChange: (index: number, quantity: number) => void;
}

export function ItemCalculator({ items, onQuantityChange }: ItemCalculatorProps) {
  return (
    <Card>
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-lg font-semibold text-secondary">
          Cost Calculator
        </CardTitle>
        <p className="text-sm text-gray-600 mt-1">
          Select items and enter quantities for automatic calculation
        </p>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {predefinedItems.map((predefinedItem, index) => {
            const item = items[index];
            return (
              <div
                key={predefinedItem.name}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <i className={`${predefinedItem.icon} text-primary text-xl`} />
                  <div>
                    <h3 className="font-medium text-secondary">{predefinedItem.name}</h3>
                    <p className="text-sm text-gray-600">{predefinedItem.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    ${predefinedItem.unitPrice} /{predefinedItem.unit}
                  </span>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-secondary">Qty:</Label>
                    <Input
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => onQuantityChange(index, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-20 text-center"
                    />
                  </div>
                  <div className="w-20 text-right">
                    <span className="font-medium text-secondary">
                      ${item.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
