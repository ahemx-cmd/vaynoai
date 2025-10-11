import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, ExternalLink, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";

interface URLSummaryProps {
  analyzedData: any;
  url: string;
}

const URLSummary = ({ analyzedData, url }: URLSummaryProps) => {
  if (!analyzedData) return null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          View URL Summary
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Product Analysis Summary
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* URL */}
          <div>
            <label className="text-sm font-medium text-muted-foreground">Source URL</label>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline mt-1"
            >
              {url}
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Title */}
          {analyzedData.title && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Product Title
              </label>
              <p className="text-lg font-semibold">{analyzedData.title}</p>
            </Card>
          )}

          {/* Description */}
          {analyzedData.description && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Description
              </label>
              <p className="text-base leading-relaxed">{analyzedData.description}</p>
            </Card>
          )}

          {/* Key Features */}
          {analyzedData.features && analyzedData.features.length > 0 && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-3 block">
                Key Features Identified
              </label>
              <ul className="space-y-2">
                {analyzedData.features.map((feature: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {/* Target Audience */}
          {analyzedData.target_audience && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Target Audience
              </label>
              <p className="text-base">{analyzedData.target_audience}</p>
            </Card>
          )}

          {/* Price */}
          {analyzedData.price && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Pricing
              </label>
              <p className="text-lg font-semibold">{analyzedData.price}</p>
            </Card>
          )}

          {/* Brand Voice */}
          {analyzedData.brand_voice && (
            <Card className="p-4 glass-card">
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Detected Brand Voice
              </label>
              <p className="text-base capitalize">{analyzedData.brand_voice}</p>
            </Card>
          )}

          <div className="bg-muted/30 rounded-lg p-4 text-sm">
            <p className="text-muted-foreground">
              This analysis was automatically generated from your landing page to create 
              personalized email content that matches your product and brand voice.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default URLSummary;