import { ExternalLink } from "lucide-react";

interface VaynoWatermarkProps {
  className?: string;
}

const VaynoWatermark = ({ className = "" }: VaynoWatermarkProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 text-xs text-muted-foreground py-4 px-6 border-t border-border/50 ${className}`}>
      <span>Powered by</span>
      <a
        href="https://vayno.ai"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:underline flex items-center gap-1 transition-smooth"
      >
        Vayno
        <ExternalLink className="w-3 h-3" />
      </a>
    </div>
  );
};

export default VaynoWatermark;
