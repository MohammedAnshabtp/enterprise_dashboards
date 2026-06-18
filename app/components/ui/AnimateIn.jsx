"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "../../lib/cn";

const variants = {
  fadeUp:    { hidden: "opacity-0 translate-y-4",   visible: "opacity-100 translate-y-0" },
  fadeDown:  { hidden: "opacity-0 -translate-y-4",  visible: "opacity-100 translate-y-0" },
  fadeLeft:  { hidden: "opacity-0 -translate-x-4",  visible: "opacity-100 translate-x-0" },
  fadeRight: { hidden: "opacity-0 translate-x-4",   visible: "opacity-100 translate-x-0" },
  fade:      { hidden: "opacity-0",                  visible: "opacity-100" },
  scale:     { hidden: "opacity-0 scale-95",         visible: "opacity-100 scale-100" },
};

/**
 * Reveals children with an animation when they scroll into view.
 * Uses IntersectionObserver — zero external dependencies.
 *
 * @param {string}  variant   - Animation type: fadeUp | fadeDown | fadeLeft | fadeRight | fade | scale
 * @param {number}  delay     - Delay in ms (applied via inline style)
 * @param {number}  duration  - Duration in ms (default 400)
 * @param {boolean} once      - Animate only the first time (default true)
 */
export default function AnimateIn({
  children,
  variant = "fadeUp",
  delay = 0,
  duration = 400,
  once = true,
  className,
  as: Tag = "div",
  ...props
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  const v = variants[variant] ?? variants.fadeUp;

  return (
    <Tag
      ref={ref}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
        transitionProperty: "opacity, transform",
      }}
      className={cn(visible ? v.visible : v.hidden, className)}
      {...props}
    >
      {children}
    </Tag>
  );
}
