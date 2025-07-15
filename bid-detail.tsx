import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Edit, Save, X, Hammer, Calculator, FileText } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bid, BidItem } from "@shared/schema";

export default function BidDetail() {
  const [, navigate] = useLocation();
  const [, params] = useRoute("/bid/:id");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    clientName: "",
    projectLocation: "",
    date: "",
  });

  const bidId = params?.id;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
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
  }, [isAuthenticated, authLoading, toast]);

  const { data: bid, isLoading: bidLoading } = useQuery<Bid>({
    queryKey: ["/api/bids", bidId],
    enabled: !!bidId,
  });

  const { data: bidItems, isLoading: itemsLoading } = useQuery<BidItem[]>({
    queryKey: ["/api/bid-items", bidId],
    enabled: !!bidId,
  });

  const updateBidMutation = useMutation({
    mutationFn: async (updatedBid: Partial<Bid>) => {
      const response = await apiRequest("PATCH", `/api/bids/${bidId}`, updatedBid);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bid updated successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bids", bidId] });
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
      setIsEditing(false);
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
        description: "Failed to update bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (bid) {
      setEditData({
        clientName: bid.clientName,
        projectLocation: bid.projectLocation,
        date: bid.date,
      });
    }
  }, [bid]);

  const handleSave = () => {
    updateBidMutation.mutate(editData);
  };

  const handleCancel = () => {
    if (bid) {
      setEditData({
        clientName: bid.clientName,
        projectLocation: bid.projectLocation,
        date: bid.date,
      });
    }
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (authLoading || bidLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Hammer className="text-primary text-2xl mr-3" />
                <h1 className="text-xl font-semibold text-secondary">
                  Bid Details
                </h1>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/bid-history")}
                className="text-secondary hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        </main>
      </div>
    );
  }

  if (!bid) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-surface shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Hammer className="text-primary text-2xl mr-3" />
                <h1 className="text-xl font-semibold text-secondary">
                  Bid Details
                </h1>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/bid-history")}
                className="text-secondary hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Bid not found</p>
            <Button
              onClick={() => navigate("/bid-history")}
              className="mt-4 bg-primary hover:bg-primary-dark"
            >
              Back to History
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const subtotal = parseFloat(bid.subtotal);
  const materials = parseFloat(bid.materials);
  const labor = parseFloat(bid.labor);
  const overhead = parseFloat(bid.overhead);
  const total = parseFloat(bid.total);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Hammer className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-semibold text-secondary">
                Bid Details
              </h1>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={updateBidMutation.isPending}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={updateBidMutation.isPending}
                    className="bg-primary hover:bg-primary-dark"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary-dark"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate("/bid-history")}
                className="text-secondary hover:text-primary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to History
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <FileText className="text-primary mr-3" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="clientName" className="text-sm font-medium text-secondary">
                    Client Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="clientName"
                      value={editData.clientName}
                      onChange={(e) => setEditData({ ...editData, clientName: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-secondary mt-1">{bid.clientName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="projectLocation" className="text-sm font-medium text-secondary">
                    Project Location
                  </Label>
                  {isEditing ? (
                    <Input
                      id="projectLocation"
                      value={editData.projectLocation}
                      onChange={(e) => setEditData({ ...editData, projectLocation: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-secondary mt-1">{bid.projectLocation}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="date" className="text-sm font-medium text-secondary">
                    Date
                  </Label>
                  {isEditing ? (
                    <Input
                      id="date"
                      type="date"
                      value={editData.date}
                      onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="text-lg font-medium text-secondary mt-1">{formatDate(bid.date)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calculator className="text-primary mr-3" />
                Bid Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bidItems && bidItems.length > 0 ? (
                <div className="space-y-3">
                  {bidItems.map((item, index) => {
                    const unitPrice = typeof item.unitPrice === 'string' ? parseFloat(item.unitPrice) : item.unitPrice;
                    const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity;
                    const total = typeof item.total === 'string' ? parseFloat(item.total) : item.total;
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-secondary">{item.name}</h4>
                          <p className="text-sm text-gray-600">
                            ${unitPrice.toFixed(2)} × {quantity.toFixed(0)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${total.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No items found for this bid</p>
              )}
            </CardContent>
          </Card>

          {/* Bid Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Bid Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Materials (15%):</span>
                  <span className="font-medium">${materials.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Labor (25%):</span>
                  <span className="font-medium">${labor.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-secondary">Overhead (10%):</span>
                  <span className="font-medium">${overhead.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-secondary">Total:</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}