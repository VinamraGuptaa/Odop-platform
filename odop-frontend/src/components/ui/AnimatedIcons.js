import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

// Animated MapPin Icon
export const AnimatedMapPin = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.1, y: -2 }}
            {...props}
        >
            <motion.path
                d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            />
            <motion.circle
                cx="12"
                cy="10"
                r="3"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                initial={{ scale: 0, opacity: 0.8 }}
                animate={{ scale: [1, 1.5, 1], opacity: [0.8, 0, 0.8] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Package Icon
export const AnimatedPackage = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            whileHover={{ scale: 1.1, rotateY: 15 }}
            {...props}
        >
            <motion.path
                d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />
            <motion.polyline
                points="3.27 6.96 12 12.01 20.73 6.96"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeInOut" }}
            />
            <motion.line
                x1="12"
                y1="22.08"
                x2="12"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.8, duration: 0.5, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Close Icon (X)
export const AnimatedClose = ({ className, onClick, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block cursor-pointer", className)}
            onClick={onClick}
            whileHover={{ scale: 1.2, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            {...props}
        >
            <motion.line
                x1="18"
                y1="6"
                x2="6"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
            <motion.line
                x1="6"
                y1="6"
                x2="18"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Sparkles Icon
export const AnimatedSparkles = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            {...props}
        >
            {[0, 1, 2].map((index) => (
                <motion.g key={index}>
                    <motion.path
                        d="M12 3l1.545 4.635L18.18 9.18l-4.635 1.545L12 15.36l-1.545-4.635L5.82 9.18l4.635-1.545L12 3z"
                        fill="currentColor"
                        initial={{ opacity: 0.3, scale: 0.8 }}
                        animate={{
                            opacity: [0.3, 1, 0.3],
                            scale: [0.8, 1, 0.8],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.3,
                            ease: "easeInOut"
                        }}
                        transform={`rotate(${index * 45} 12 12)`}
                    />
                </motion.g>
            ))}
        </motion.svg>
    );
};

// Animated Search Icon
export const AnimatedSearch = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            whileHover={{ scale: 1.1 }}
            {...props}
        >
            <motion.circle
                cx="11"
                cy="11"
                r="8"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.4, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Menu Icon
export const AnimatedMenu = ({ className, isOpen, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block cursor-pointer", className)}
            {...props}
        >
            <motion.line
                x1="3"
                y1="12"
                x2="21"
                y2="12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ rotate: isOpen ? 45 : 0, y: isOpen ? 0 : 0 }}
                transition={{ duration: 0.3 }}
            />
            <motion.line
                x1="3"
                y1="6"
                x2="21"
                y2="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ opacity: isOpen ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            />
            <motion.line
                x1="3"
                y1="18"
                x2="21"
                y2="18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                animate={{ rotate: isOpen ? -45 : 0, y: isOpen ? -12 : 0 }}
                transition={{ duration: 0.3 }}
            />
        </motion.svg>
    );
};

// Animated ChevronDown Icon
export const AnimatedChevronDown = ({ className, isOpen, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            {...props}
        >
            <motion.polyline
                points="6 9 12 15 18 9"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </motion.svg>
    );
};

// Animated Sun Icon
export const AnimatedSun = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            whileHover={{ scale: 1.2 }}
            {...props}
        >
            <motion.circle
                cx="12"
                cy="12"
                r="5"
                stroke="currentColor"
                strokeWidth="2"
                fill="currentColor"
            />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => (
                <motion.line
                    key={angle}
                    x1="12"
                    y1="1"
                    x2="12"
                    y2="3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    transform={`rotate(${angle} 12 12)`}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </motion.svg>
    );
};

// Animated Moon Icon
export const AnimatedMoon = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            whileHover={{ scale: 1.2, rotate: -15 }}
            {...props}
        >
            <motion.path
                d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="currentColor"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Filter Icon
export const AnimatedFilter = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            whileHover={{ scale: 1.1 }}
            {...props}
        >
            <motion.polygon
                points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};

// Animated Grid Icon
export const AnimatedGrid = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            whileHover={{ scale: 1.1 }}
            {...props}
        >
            {[
                { x: 3, y: 3 },
                { x: 10, y: 3 },
                { x: 17, y: 3 },
                { x: 3, y: 10 },
                { x: 10, y: 10 },
                { x: 17, y: 10 },
                { x: 3, y: 17 },
                { x: 10, y: 17 },
                { x: 17, y: 17 },
            ].map((pos, index) => (
                <motion.rect
                    key={index}
                    x={pos.x}
                    y={pos.y}
                    width="5"
                    height="5"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="2"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 300,
                        damping: 20
                    }}
                />
            ))}
        </motion.svg>
    );
};

// Animated Briefcase Icon
export const AnimatedBriefcase = ({ className, ...props }) => {
    return (
        <motion.svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={cn("inline-block", className)}
            whileHover={{ scale: 1.1, y: -2 }}
            {...props}
        >
            <motion.rect
                x="2"
                y="7"
                width="20"
                height="14"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
            />
            <motion.path
                d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
                stroke="currentColor"
                strokeWidth="2"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.4, duration: 0.6, ease: "easeInOut" }}
            />
        </motion.svg>
    );
};
