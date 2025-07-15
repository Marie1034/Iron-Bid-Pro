import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface CustomItemFormProps {
  onAddItem: (name: string, unitPrice: number, quantity: number) => void;
}

export function CustomItemForm({ onAddItem }: CustomItemFormProps) {
  const [itemName, setItemName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !unitPrice || !quantity) {
      return;
    }

    const parsedUnitPrice = parseFloat(unitPrice);
    const parsedQuantity = parseFloat(quantity);

    if (isNaN(parsedUnitPrice) || isNaN(parsedQuantity)) {
      return;
    }

    onAddItem(itemName, parsedUnitPrice, parsedQuantity);
    
    // Reset form
    setItemName("");
    setUnitPrice("");
    setQuantity("");
  };

  return (
    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-medium text-secondary mb-3">Add Custom Item</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Input
          type="text"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          placeholder="Item name"
          required
        />
        <Input
          type="number"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value)}
          placeholder="Unit price"
          min="0"
          step="0.01"
          required
        />
        <Input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
          min="0"
          step="0.1"
          required
        />
        <Button type="submit" className="bg-primary hover:bg-primary-dark">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </form>
    </div>
  );
}
