import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUp, FolderPlus, Sparkles, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingProps {
    onComplete: () => void;
}

const slides = [
    {
        icon: FileUp,
        title: 'Importe Suas Músicas',
        description: 'Adicione arquivos de áudio e vídeo do seu dispositivo. Organize sua coleção em um só lugar.',
        gradient: 'from-blue-500/20 to-cyan-500/20',
    },
    {
        icon: FolderPlus,
        title: 'Crie Álbuns Personalizados',
        description: 'Organize suas músicas favoritas em álbuns customizados. Edite nomes, artistas e capas.',
        gradient: 'from-purple-500/20 to-pink-500/20',
    },
    {
        icon: Sparkles,
        title: 'Experiência Premium',
        description: 'Player fullscreen com animação de vinil, suporte a vídeo e interface moderna.',
        gradient: 'from-orange-500/20 to-red-500/20',
    },
];

export function Onboarding({ onComplete }: OnboardingProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [direction, setDirection] = useState(0);

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setDirection(1);
            setCurrentSlide(currentSlide + 1);
        } else {
            handleComplete();
        }
    };

    const handleSkip = () => {
        handleComplete();
    };

    const handleComplete = () => {
        localStorage.setItem('hasSeenOnboarding', 'true');
        onComplete();
    };

    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    const currentSlideData = slides[currentSlide];
    const Icon = currentSlideData.icon;

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
            {/* Skip Button */}
            <div className="absolute top-4 right-4 z-10">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSkip}
                    className="text-muted-foreground hover:text-foreground"
                >
                    Pular
                    <X size={16} className="ml-1" />
                </Button>
            </div>

            {/* Slides Container */}
            <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
                <AnimatePresence initial={false} custom={direction} mode="wait">
                    <motion.div
                        key={currentSlide}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                            opacity: { duration: 0.2 },
                        }}
                        className="w-full max-w-md"
                    >
                        <div className="flex flex-col items-center text-center space-y-6">
                            {/* Icon with Gradient Background */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                                className={`w-32 h-32 rounded-3xl bg-gradient-to-br ${currentSlideData.gradient} flex items-center justify-center relative`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-3xl" />
                                <Icon size={64} className="text-primary relative z-10" strokeWidth={1.5} />
                            </motion.div>

                            {/* Title */}
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-3xl font-bold text-foreground"
                            >
                                {currentSlideData.title}
                            </motion.h2>

                            {/* Description */}
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-muted-foreground text-lg leading-relaxed max-w-sm"
                            >
                                {currentSlideData.description}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            <div className="pb-8 px-4 space-y-6">
                {/* Progress Dots */}
                <div className="flex justify-center gap-2">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => {
                                setDirection(index > currentSlide ? 1 : -1);
                                setCurrentSlide(index);
                            }}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide
                                    ? 'w-8 bg-primary'
                                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                                }`}
                        />
                    ))}
                </div>

                {/* Next/Start Button */}
                <div className="max-w-md mx-auto">
                    <Button
                        onClick={handleNext}
                        className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12 text-lg"
                        size="lg"
                    >
                        {currentSlide === slides.length - 1 ? (
                            'Começar'
                        ) : (
                            <>
                                Próximo
                                <ChevronRight size={20} className="ml-2" />
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
