import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { ProjectInfoForm } from "@/components/project-info-form";
import { BidSummary } from "@/components/bid-summary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { History, Hammer, Save, ChevronDown, ChevronRight } from "lucide-react";
import { predefinedItems } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MaterialItem {
  name: string;
  unitPrice: number;
  quantity: number;
  total: number;
}

interface BidSection {
  sectionName: string;
  materials: MaterialItem[];
}

interface LaborSection {
  workerCount: number;
  hourlyRate: number;
  hoursWorked: number;
  craneHours: number;
  craneRate: number;
  total: number;
}

interface OverheadSection {
  percentage: number;
  total: number;
}

export default function Calculator() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Project information state
  const [clientName, setClientName] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Section visibility state
  const [materialsOpen, setMaterialsOpen] = useState(false);
  const [laborOpen, setLaborOpen] = useState(false);
  const [overheadOpen, setOverheadOpen] = useState(false);

  // Materials state
  const [sections, setSections] = useState<BidSection[]>([]);
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null);
  const [newSectionName, setNewSectionName] = useState("");

  const [materialInputs, setMaterialInputs] = useState<Record<number, { name: string; quantity: number }>>({});


  // Labor state
  const [laborInputs, setLaborInputs] = useState({
    workerCount: "",
    hourlyRate: "",
    hoursWorked: "",
    craneHours: "",
    craneRate: ""
  });


  // Overhead state
  const [overhead, setOverhead] = useState({
    percentage: "", // ← string now
    total: 0,
  });


  // Calculate totals
  const materialsTotal = sections.reduce((sum, section) => {
    return sum + section.materials.reduce((s, m) => s + m.total, 0);
  }, 0);
  const parseOrZero = (value: string) => parseFloat(value) || 0;

  const laborTotal =
    parseOrZero(laborInputs.workerCount) *
    parseOrZero(laborInputs.hourlyRate) *
    parseOrZero(laborInputs.hoursWorked) +
    parseOrZero(laborInputs.craneHours) *
    parseOrZero(laborInputs.craneRate);

  const subtotalForOverhead = materialsTotal + laborTotal;
  const overheadTotal = subtotalForOverhead * (parseOrZero(overhead.percentage) / 100);

  const total = materialsTotal + laborTotal + overheadTotal;

  const saveBidMutation = useMutation({
    mutationFn: async (bidData: any) => {
      const response = await apiRequest("POST", "/api/bids", bidData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bid saved successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle adding materials
  const handleAddMaterial = (materialName: string, quantity: number) => {
    const predefinedItem = predefinedItems.find(item => item.name === materialName);
    if (!predefinedItem) return;

    const newMaterial: MaterialItem = {
      name: materialName,
      unitPrice: predefinedItem.unitPrice,
      quantity,
      total: predefinedItem.unitPrice * quantity,
    };

    setSections(prev => {
      if (activeSectionIndex === null) return prev;
      const updated = [...prev];
      const section = updated[activeSectionIndex];

      const existingIndex = section.materials.findIndex(item => item.name === materialName);

      if (existingIndex >= 0) {
        section.materials[existingIndex].quantity = quantity;
        section.materials[existingIndex].total = quantity * section.materials[existingIndex].unitPrice;
      } else {
        section.materials.push(newMaterial);
      }

      return updated;
    });
  };

  // Handle labor changes
  const handleLaborChange = (field: keyof LaborSection, value: number) => {
    setLabor(prev => {
      const updated = { ...prev, [field]: value };
      const newTotal = (updated.workerCount * updated.hourlyRate * updated.hoursWorked) + (updated.craneHours * updated.craneRate);
      return { ...updated, total: newTotal };
    });
  };

  // Handle overhead changes
  const handleOverheadChange = (percentage: number) => {
    setOverhead(prev => {
      const newTotal = subtotalForOverhead * (percentage / 100);
      return { percentage, total: newTotal };
    });
  };

  const handleSave = () => {
    if (!clientName || !projectLocation) {
      toast({
        title: "Missing Information",
        description: "Please fill in client name and project location.",
        variant: "destructive",
      });
      return;
    }

    const allItems = sections.flatMap(section =>
      section.materials.map(material => ({
        sectionName: section.sectionName,
        name: material.name,
        unitPrice: material.unitPrice.toString(),
        quantity: material.quantity.toString(),
        total: material.total.toString(),
      }))
    );


    const bidData = {
      bid: {
        clientName,
        projectLocation,
        date,
        subtotal: (materialsTotal + laborTotal).toString(),
        materials: materialsTotal.toString(),
        labor: laborTotal.toString(),
        overhead: overheadTotal.toString(),
        total: total.toString(),
      },
      items: allItems.map(item => ({
        name: item.name,
        unitPrice: item.unitPrice.toString(),
        quantity: item.quantity.toString(),
        total: item.total.toString(),
      })),
    };

    saveBidMutation.mutate(bidData);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: "Iron Work Bid",
        text: `Bid for ${clientName} - ${projectLocation}: $${total.toFixed(2)}`,
      });
    } else {
      navigator.clipboard.writeText(`Bid for ${clientName} - ${projectLocation}: $${total.toFixed(2)}`);
      toast({
        title: "Copied",
        description: "Bid summary copied to clipboard!",
      });
    }
  };

  const handleClear = () => {
    setClientName("");
    setProjectLocation("");
    setDate(new Date().toISOString().split('T')[0]);
    setSelectedMaterials([]);
    setLabor({
      workerCount: 0,
      hourlyRate: 0,
      hoursWorked: 0,
      craneHours: 0,
      craneRate: 0,
      total: 0
    });
    setOverhead({
      percentage: 0,
      total: 0
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Hammer className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-secondary">
                Iron Work Bid Calculator
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate("/")}
                className="text-secondary hover:text-primary"
              >
                <History className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/bid-history")}
                className="text-secondary hover:text-primary"
              >
                <History className="w-4 h-4 mr-2" />
                Bid History
              </Button>
              <Button
                onClick={handleSave}
                disabled={saveBidMutation.isPending}
                className="bg-primary hover:bg-primary-dark"
              >
                <Save className="w-4 h-4 mr-2" />
                {saveBidMutation.isPending ? "Saving..." : "Save Bid"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Project Information */}
        <ProjectInfoForm
          clientName={clientName}
          projectLocation={projectLocation}
          date={date}
          onClientNameChange={setClientName}
          onProjectLocationChange={setProjectLocation}
          onDateChange={setDate}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calculator Section */}
          <div className="lg:col-span-2 space-y-6">

            {/* Bid Section Input */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Add Bid Section</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-4">
                  <Input
                    placeholder="e.g. North Stair"
                    value={newSectionName}
                    onChange={(e) => setNewSectionName(e.target.value)}
                  />
                  <Button
                    onClick={() => {
                      if (!newSectionName.trim()) return;
                      setSections([...sections, { sectionName: newSectionName.trim(), materials: [] }]);
                      setActiveSectionIndex(sections.length); // select the new section
                      setNewSectionName("");
                    }}
                  >
                    Add Section
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Display Buttons for Sections */}
            {sections.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {sections.map((section, index) => (
                  <Button
                    key={index}
                    variant={index === activeSectionIndex ? "default" : "outline"}
                    onClick={() => setActiveSectionIndex(index)}
                  >
                    {section.sectionName}
                  </Button>
                ))}
              </div>
            )}
        
            {/* Materials Section */}
            <Card>
              <Collapsible open={materialsOpen} onOpenChange={setMaterialsOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-secondary">Materials</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">${materialsTotal.toFixed(2)}</span>
                        {materialsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="material-select">Select Material</Label>
                          <Select
                            value={materialInputs[activeSectionIndex!]?.name || ""}
                            onValueChange={(value) => {
                              setMaterialInputs((prev) => ({
                                ...prev,
                                [activeSectionIndex!]: {
                                  ...(prev[activeSectionIndex!] || {}),
                                  name: value,
                                  quantity: 0,
                                },
                              }));                             

                            }}
                          >
                            {/* options */}                                            
                            <SelectTrigger>
                              <SelectValue placeholder="Choose a material" />
                            </SelectTrigger>
                            <SelectContent>
                              {predefinedItems.map((item) => (
                                <SelectItem key={item.name} value={item.name}>
                                  {item.name} - ${item.unitPrice}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                       
                        <div>
                          <Label htmlFor="material-quantity">Quantity</Label>

                          <Input
                            id="material-quantity"
                            type="number"
                            min="0"
                            placeholder="Enter quantity"
                            value={
                              activeSectionIndex !== null && materialInputs[activeSectionIndex]
                                ? materialInputs[activeSectionIndex].quantity
                                : ""
                            }
                            onChange={(e) => {
                              const quantityStr = e.target.value;

                              setMaterialInputs((prev) => {
                                const name = prev[activeSectionIndex!]?.name;

                                const updated = {
                                  ...prev,
                                  [activeSectionIndex!]: {
                                    ...(prev[activeSectionIndex!] || { name: "", quantity: "" }),
                                    quantity: quantityStr, // Store as string
                                  },
                                };

                                // Only call handleAddMaterial if there's a valid name and quantity is a number
                                if (name && quantityStr !== "") {
                                  const parsedQuantity = parseFloat(quantityStr);
                                  if (!isNaN(parsedQuantity)) {
                                    handleAddMaterial(name, parsedQuantity);
                                  }
                                }

                                return updated;
                              });
                            }}
                          />



                        </div>
                      </div>
                      
                      {/* Selected Materials Display */}
                      {/* Selected Materials Display */}
                      {activeSectionIndex !== null && sections[activeSectionIndex].materials.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-secondary">Selected Materials:</h4>
                          {sections[activeSectionIndex].materials.map((material, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <span className="font-medium text-secondary">{material.name}</span>
                                <span className="text-sm text-gray-600 ml-2">
                                  ${material.unitPrice.toFixed(2)} × {material.quantity}
                                </span>
                              </div>
                              <span className="font-medium text-secondary">
                                ${material.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>

            {/* Labor Section */}            
            <Card>
              <Collapsible open={laborOpen} onOpenChange={setLaborOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-secondary">Labor</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">${laborTotal.toFixed(2)}</span>
                        {laborOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="worker-count">Number of Workers</Label>
                          <Input
                            id="worker-count"
                            type="number"
                            min="0"
                            placeholder="Enter number of workers"
                            value={laborInputs.workerCount}
                            onChange={(e) =>
                              setLaborInputs(prev => ({ ...prev, workerCount: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                          <Input
                            id="hourly-rate"
                            type="number"
                            min="0"
                            placeholder="Enter hourly rate"
                            value={laborInputs.hourlyRate}
                            onChange={(e) =>
                              setLaborInputs(prev => ({ ...prev, hourlyRate: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="hours-worked">Hours Worked</Label>
                          <Input
                            id="hours-worked"
                            type="number"
                            min="0"
                            placeholder="Enter hours worked"
                            value={laborInputs.hoursWorked}
                            onChange={(e) =>
                              setLaborInputs(prev => ({ ...prev, hoursWorked: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="crane-hours">Crane Hours</Label>
                          <Input
                            id="crane-hours"
                            type="number"
                            min="0"
                            placeholder="Enter crane hours"
                            value={laborInputs.craneHours}
                            onChange={(e) =>
                              setLaborInputs(prev => ({ ...prev, craneHours: e.target.value }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="crane-rate">Crane Rate ($/hour)</Label>
                          <Input
                            id="crane-rate"
                            type="number"
                            min="0"
                            placeholder="Enter crane rate"
                            value={laborInputs.craneRate}
                            onChange={(e) =>
                              setLaborInputs(prev => ({ ...prev, craneRate: e.target.value }))
                            }
                          />
                        </div>
                      </div>

                      {/* Labor Summary */}
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Worker Cost:</span>
                          <span className="text-sm font-medium">
                            ${(
                              parseOrZero(laborInputs.workerCount) *
                              parseOrZero(laborInputs.hourlyRate) *
                              parseOrZero(laborInputs.hoursWorked)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Crane Cost:</span>
                          <span className="text-sm font-medium">
                            ${(
                              parseOrZero(laborInputs.craneHours) *
                              parseOrZero(laborInputs.craneRate)
                            ).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center border-t pt-2">
                          <span className="font-medium text-secondary">Total Labor:</span>
                          <span className="font-medium text-secondary">${laborTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>


            {/* Overhead Section */}
            <Card>
              <Collapsible open={overheadOpen} onOpenChange={setOverheadOpen}>
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-secondary">Overhead</CardTitle>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">${overheadTotal.toFixed(2)}</span>
                        {overheadOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="overhead-percentage">Overhead Percentage (%)</Label>
                        <Input
                          id="overhead-percentage"
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={overhead.percentage}
                          onChange={(e) => {
                            const value = e.target.value;

                            setOverhead((prev) => ({
                              ...prev,
                              percentage: value,
                              total: subtotalForOverhead * (parseFloat(value) || 0) / 100,
                            }));
                          }}
                          placeholder="Enter percentage"
                        />

                      </div>
                      
                      <div className="bg-green-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Subtotal (Materials + Labor):</span>
                          <span className="text-sm font-medium">${subtotalForOverhead.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Overhead ({overhead.percentage}%):</span>
                          <span className="text-sm font-medium">${overheadTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          </div>

          {/* Summary Section */}
          <BidSummary
            subtotal={subtotalForOverhead}
            materials={materialsTotal}
            labor={laborTotal}
            overhead={overheadTotal}
            total={total}
            onSave={handleSave}
            onPrint={handlePrint}
            onShare={handleShare}
            onClear={handleClear}
            isSaving={saveBidMutation.isPending}
          />
        </div>
      </main>
    </div>
  );
}
