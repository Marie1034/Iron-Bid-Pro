import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { 
  Calculator, 
  History, 
  User, 
  LogOut, 
  Hammer, 
  FileText,
  TrendingUp,
  Clock
} from "lucide-react";
import type { Bid } from "@shared/schema";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  
  const { data: bids } = useQuery<Bid[]>({
    queryKey: ["/api/bids"],
  });

  const recentBids = bids?.slice(0, 5) || [];
  const totalBids = bids?.length || 0;
  const totalValue = bids?.reduce((sum, bid) => sum + parseFloat(bid.total), 0) || 0;

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-surface shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Hammer className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-secondary">
                Iron Bid Pro
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-sm text-secondary">
                  {user?.firstName || user?.email || 'User'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-secondary mb-2">
            Welcome back, {user?.firstName || 'Iron Worker'}!
          </h2>
          <p className="text-gray-600">
            Manage your iron work bids and calculations from your dashboard
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Bids
              </CardTitle>
              <FileText className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{totalBids}</div>
              <p className="text-xs text-gray-500">
                Saved in your account
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Value
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                ${totalValue.toLocaleString()}
              </div>
              <p className="text-xs text-gray-500">
                Across all projects
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Average Bid
              </CardTitle>
              <Calculator className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                ${totalBids > 0 ? (totalValue / totalBids).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-gray-500">
                Per project
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <Calculator className="text-primary mr-3" />
                Create New Bid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Start a new bid calculation with predefined iron work items 
                and automatic markup calculations.
              </p>
              <Button 
                onClick={() => navigate('/calculator')}
                className="w-full bg-primary hover:bg-primary-dark"
              >
                Start New Bid
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <History className="text-primary mr-3" />
                View Bid History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Review all your saved bids, client information, and project details. 
                Export or modify existing bids.
              </p>
              <Button 
                onClick={() => navigate('/bid-history')}
                variant="outline"
                className="w-full"
              >
                View All Bids
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Bids */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-xl">
              <Clock className="text-primary mr-3" />
              Recent Bids
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentBids.length > 0 ? (
              <div className="space-y-3">
                {recentBids.map((bid) => (
                  <div 
                    key={bid.id} 
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-secondary">{bid.clientName}</h4>
                      <p className="text-sm text-gray-600">{bid.projectLocation}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(bid.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary">
                        ${parseFloat(bid.total).toFixed(2)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/bid/${bid.id}`)}
                        className="text-xs"
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calculator className="text-gray-400 text-5xl mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No bids yet</p>
                <p className="text-gray-400 text-sm mb-4">
                  Create your first bid to get started
                </p>
                <Button 
                  onClick={() => navigate('/calculator')}
                  className="bg-primary hover:bg-primary-dark"
                >
                  Create First Bid
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}