import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Music2 } from 'lucide-react';

interface SplashScreenProps {
    onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Fade out after 2.5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2500);

        // Call onComplete after fade out animation
        const completeTimer = setTimeout(() => {
            onComplete();
        }, 3000);

        return () => {
            clearTimeout(timer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isVisible ? 1 : 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5"
        >
            <div className="flex flex-col items-center gap-6">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 0.2
                    }}
                    className="relative"
                >
                    {/* Glow effect */}
                    <div className="absolute inset-0 blur-3xl opacity-30">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent" />
                    </div>

                    {/* Icon */}
                    <div className="relative w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl">
                        <Music2 size={64} className="text-primary-foreground" strokeWidth={1.5} />
                    </div>
                </motion.div>

                {/* App Name */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className="text-center"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        VibePlayer
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">
                        Sua música, seu estilo
                    </p>
                </motion.div>

                {/* Loading indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="flex gap-1.5"
                >
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 rounded-full bg-primary"
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                                duration: 1,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </motion.div>
            </div>
        </motion.div>
    );
}
