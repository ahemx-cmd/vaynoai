import { ExternalLink } from "lucide-react";
import vaynoIcon from "@/assets/vayno-icon.png";

interface VaynoWatermarkProps {
  className?: string;
}

const VaynoWatermark = ({ className = "" }: VaynoWatermarkProps) => {
  return (
    <div className={`flex items-center justify-center gap-2 text-xs py-4 px-6 border-t border-border/50 ${className}`}>
      <span className="text-muted-foreground">Powered by</span>
      <a
        href="https://vaynoai.lovable.app"
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-smooth"
      >
        <img src={vaynoIcon} alt="Vayno" className="w-4 h-4" />
        Vayno
        <ExternalLink className="w-3 h-3 text-primary" />
      </a>
    </div>
  );
};

export default VaynoWatermark;
