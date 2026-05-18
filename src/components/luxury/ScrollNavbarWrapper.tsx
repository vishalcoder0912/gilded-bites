import type { ReactNode } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useState } from "react";

export default function ScrollNavbarWrapper({ children }: { children: ReactNode }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);

  useMotionValueEvent(scrollY, "change", (current) => {
    const previous = scrollY.getPrevious() ?? 0;
    setHidden(current > previous && current > 120);
  });

  return (
    <motion.div
      animate={{ y: hidden ? -96 : 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50"
    >
      {children}
    </motion.div>
  );
}
