"use client";;
import { cn } from "@/lib/utils";
import { IconMenu2, IconX } from "@tabler/icons-react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "motion/react";

import React, { useRef, useState } from "react";
import { useRouter } from "next/navigation";

interface NavBodyProps {
  children: React.ReactNode | ((props: { visible: boolean }) => React.ReactNode);
  className?: string;
  visible: boolean;
}

export const Navbar = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const ref = useRef(null);
  const { scrollY } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 100) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  });

  return (
    <motion.div
      ref={ref}
      // IMPORTANT: Change this to class of `fixed` if you want the navbar to be fixed
      className={cn("sticky inset-x-0 top-20 z-40 w-full", className)}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && typeof child.type !== 'string') {
          return React.cloneElement(child, { visible } as any);
        }
        return child;
      })}
    </motion.div>
  );
};

export const NavBody = ({ children, className, visible }: NavBodyProps) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "40%" : "100%",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2,
      }}
      style={{
        minWidth: "800px",
      }}
      className={cn(
        "relative z-[60] mx-auto hidden w-full max-w-7xl flex-row items-center justify-between self-start rounded-full bg-transparent px-4 py-6 lg:flex",
        visible && "bg-white/80",
        className,
      )}
    >
      {typeof children === 'function' ? children({ visible }) : children}
    </motion.div>
  );
};

export const NavItems = ({
  items,
  className,
  onItemClick
}: {
  items: Array<{ name: string; link: string; dropdown?: Array<{ name: string; link: string }> }>;
  className?: string;
  onItemClick?: () => void;
}) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const router = useRouter();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  const handleItemClick = (item: any, idx: number) => {
    if (item.dropdown) {
      setDropdownOpen(dropdownOpen === idx ? null : idx);
    } else {
      // For Interview Q&A, always go to /interview-prep
      if (item.name === "Interview Q&A") {
        router.push('/interview-prep');
      } else {
        router.push(item.link);
      }
      onItemClick?.();
    }
  };

  const getSmartLink = (itemName: string) => {
    if (itemName === "Dashboard") {
      // Dashboard goes to main interview prep page
      return '/interview-prep';
    } else if (itemName === "Interview Practice") {
      // Always go to interview prep dashboard
      return '/interview-prep/dashboard';
    } else if (itemName === "Coding Page") {
      // Always go to coding test page
      return '/interview-prep/coding-test';
    }
    return itemName;
  };

  return (
    <motion.div
      onMouseLeave={() => {
        setHovered(null);
        setDropdownOpen(null);
      }}
      className={cn(
        "absolute inset-0 hidden flex-1 flex-row items-center justify-center space-x-2 text-base font-medium text-black transition duration-200 hover:text-gray-800 lg:flex lg:space-x-2",
        className
      )}>
      {items.map((item, idx) => (
        <div key={`link-${idx}`} className="relative">
          <button
            onMouseEnter={() => setHovered(idx)}
            onClick={() => handleItemClick(item, idx)}
            className="relative px-4 py-2 text-black hover:text-gray-800 text-base bg-transparent border-none cursor-pointer"
          >
            {hovered === idx && (
              <motion.div
                layoutId="hovered"
                className="absolute inset-0 h-full w-full rounded-full bg-gray-100" />
            )}
            <span className="relative z-20 flex items-center gap-1">
              {item.name}
              {item.dropdown && (
                <svg 
                  className={`w-4 h-4 transition-transform ${dropdownOpen === idx ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
          </button>
          
          {/* Dropdown Menu */}
          {item.dropdown && (
            <AnimatePresence>
              {dropdownOpen === idx && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  {item.dropdown.map((dropdownItem, dropdownIdx) => (
                    <button
                      key={dropdownIdx}
                      onClick={() => {
                        const smartLink = getSmartLink(dropdownItem.name);
                        router.push(smartLink);
                        setDropdownOpen(null);
                        onItemClick?.();
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      {dropdownItem.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export const MobileNav = ({
  children,
  className,
  visible
}: {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}) => {
  return (
    <motion.div
      animate={{
        backdropFilter: visible ? "blur(10px)" : "none",
        boxShadow: visible
          ? "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset"
          : "none",
        width: visible ? "90%" : "100%",
        paddingRight: visible ? "12px" : "0px",
        paddingLeft: visible ? "12px" : "0px",
        borderRadius: visible ? "4px" : "2rem",
        y: visible ? 20 : 0,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.2,
      }}
      className={cn(
        "relative z-50 mx-auto flex w-full max-w-[calc(100vw-2rem)] flex-col items-center justify-between bg-transparent px-0 py-2 lg:hidden",
        visible && "bg-white/80",
        className
      )}>
      {children}
    </motion.div>
  );
};

export const MobileNavHeader = ({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn("flex w-full flex-row items-center justify-between", className)}>
      {children}
    </div>
  );
};

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  onClose
}: {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: -20,
            scale: 0.95
          }}
          animate={{ 
            opacity: 1, 
            y: 0,
            scale: 1
          }}
          exit={{ 
            opacity: 0, 
            y: -20,
            scale: 0.95
          }}
          transition={{
            duration: 0.15,
            ease: "easeOut"
          }}
          className={cn(
            "absolute inset-x-0 top-16 z-50 flex w-full flex-col items-start justify-start gap-4 rounded-xl bg-white border border-gray-200 px-6 py-8 shadow-lg",
            className
          )}>
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const MobileNavToggle = ({
  isOpen,
  onClick
}: {
  isOpen: boolean;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="relative p-2 rounded-lg bg-gray-100 hover:bg-gray-200"
    >
      <motion.div
        animate={{ rotate: isOpen ? 180 : 0 }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <IconX className="w-5 h-5 text-gray-700" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
            >
              <IconMenu2 className="w-5 h-5 text-gray-700" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </button>
  );
};

export const NavbarLogo = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.replace('/')}
      className="relative z-20 mr-4 flex items-center text-sm font-normal text-black -ml-[50px] cursor-pointer"
      aria-label="Go to home"
    >
      <img 
        src="/mainlogo.png" 
        alt="Key2Career Logo" 
        className="w-[150px] h-[48px] object-contain p-0 m-0"
      />
    </button>
  );
};

export const NavbarButton = ({
  href,
  as: Tag = "a",
  children,
  className,
  variant = "primary",
  ...props
}: {
  href?: string;
  as?: React.ElementType;
  children?: React.ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "dark" | "gradient";
  [key: string]: any;
}) => {
  const baseStyles =
    "px-4 py-2 rounded-md bg-white button bg-white text-black text-base font-bold relative cursor-pointer hover:-translate-y-0.5 transition duration-200 inline-block text-center";

  const variantStyles = {
    primary:
      "shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    secondary: "bg-transparent shadow-none text-black",
    dark: "bg-black text-white shadow-[0_0_24px_rgba(34,_42,_53,_0.06),_0_1px_1px_rgba(0,_0,_0,_0.05),_0_0_0_1px_rgba(34,_42,_53,_0.04),_0_0_4px_rgba(34,_42,_53,_0.08),_0_16px_68px_rgba(47,_48,_55,_0.05),_0_1px_0_rgba(255,_255,_255,_0.1)_inset]",
    gradient:
      "bg-gradient-to-b from-blue-500 to-blue-700 text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset]",
  };

  return (
    <Tag
      href={href || undefined}
      className={cn(baseStyles, variantStyles[variant], className)}
      {...props}>
      {children}
    </Tag>
  );
}; 