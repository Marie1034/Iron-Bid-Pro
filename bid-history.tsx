import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ArrowLeft, Eye, Trash2, Hammer } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Bid } from "@shared/schema";

export default function BidHistory() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bids, isLoading } = useQuery<Bid[]>({
    queryKey: ["/api/bids"],
  });

  const deleteBidMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bids/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bid deleted successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/bids"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete bid. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this bid?")) {
      deleteBidMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
                Bid History
              </h1>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="text-secondary hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-secondary">
              All Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    <Skeleton className="h-4 w-[100px]" />
                  </div>
                ))}
              </div>
            ) : bids && bids.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bids.map((bid) => (
                      <TableRow key={bid.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-secondary">
                          {formatDate(bid.date)}
                        </TableCell>
                        <TableCell className="text-sm text-secondary">
                          {bid.clientName}
                        </TableCell>
                        <TableCell className="text-sm text-secondary">
                          {bid.projectLocation}
                        </TableCell>
                        <TableCell className="text-sm text-right font-medium text-primary">
                          ${parseFloat(bid.total).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/bid/${bid.id}`)}
                              className="text-primary hover:text-primary-dark"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(bid.id)}
                              disabled={deleteBidMutation.isPending}
                              className="text-error hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No bids found</p>
                <p className="text-gray-400 text-sm mt-2">
                  Create your first bid to see it here
                </p>
                <Button
                  onClick={() => navigate("/calculator")}
                  className="mt-4 bg-primary hover:bg-primary-dark"
                >
                  Create New Bid
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
