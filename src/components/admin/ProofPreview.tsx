import { useState } from "react";
import { Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProofPreviewProps {
  src: string;
  orderId: string;
}

export const ProofPreview = ({ src, orderId }: ProofPreviewProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="group relative w-12 h-12 rounded-md overflow-hidden border border-border hover:border-primary transition-colors"
        aria-label="View payment proof"
      >
        <img src={src} alt={`Payment proof ${orderId}`} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-abyss/60 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center">
          <Eye className="w-4 h-4 text-primary" />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[80] bg-abyss/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] grid place-items-center p-6 pointer-events-none"
            >
              <div className="luxe-card p-6 max-w-lg w-full pointer-events-auto">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="eyebrow">Payment proof</div>
                    <div className="font-mono text-sm mt-1">{orderId}</div>
                  </div>
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 text-muted-foreground hover:text-foreground"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="rounded-md overflow-hidden border border-border bg-rich/40">
                  <img src={src} alt={`Payment proof ${orderId}`} className="w-full h-auto" />
                </div>
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Mock screenshot — verify UTR with bank statement before approval.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
