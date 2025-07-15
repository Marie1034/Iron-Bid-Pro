import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectInfoFormProps {
  clientName: string;
  projectLocation: string;
  date: string;
  onClientNameChange: (value: string) => void;
  onProjectLocationChange: (value: string) => void;
  onDateChange: (value: string) => void;
}

export function ProjectInfoForm({
  clientName,
  projectLocation,
  date,
  onClientNameChange,
  onProjectLocationChange,
  onDateChange,
}: ProjectInfoFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-secondary">
          Project Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="clientName" className="text-sm font-medium text-secondary">
              Client Name
            </Label>
            <Input
              id="clientName"
              type="text"
              value={clientName}
              onChange={(e) => onClientNameChange(e.target.value)}
              placeholder="Enter client name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="projectLocation" className="text-sm font-medium text-secondary">
              Project Location
            </Label>
            <Input
              id="projectLocation"
              type="text"
              value={projectLocation}
              onChange={(e) => onProjectLocationChange(e.target.value)}
              placeholder="Enter project location"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="date" className="text-sm font-medium text-secondary">
              Date
            </Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="mt-2"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
