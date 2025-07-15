import { Button } from "@/components/ui/button";
import { Hammer } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Hammer className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Iron Bid Pro
              </h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-primary hover:bg-primary-dark text-white"
            >
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            <Hammer className="text-primary text-6xl mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Professional Bid Calculator for Iron Workers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Calculate accurate project bids with predefined iron work items, 
              custom additions, and automatic markup calculations. Save and manage 
              all your bids in one place.
            </p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              size="lg"
              className="bg-primary hover:bg-primary-dark text-white px-8 py-3"
            >
              Get Started Free
            </Button>
            
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold mb-4">
            Ready to Create Professional Bids?
          </h3>
          <p className="text-xl opacity-90">
            Join iron workers who trust Iron Bid Pro for accurate project estimates
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Hammer className="text-primary text-2xl mr-2" />
            <span className="text-xl font-bold">Iron Bid Pro</span>
          </div>
          <p className="text-gray-400">
            Professional bid calculation tools for iron workers
          </p>
        </div>
      </footer>
    </div>
  );
}