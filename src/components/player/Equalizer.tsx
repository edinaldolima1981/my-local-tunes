/**
 * @fileoverview Componente do Equalizador
 * 
 * Interface visual para o equalizador de 5 bandas com:
 * - Sliders verticais para cada banda
 * - Presets predefinidos
 * - Persistência automática das configurações
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  equalizerService, 
  EqualizerBand, 
  EQUALIZER_PRESETS 
} from '@/services/equalizerService';

interface EqualizerProps {
  /** Elemento de áudio para conectar */
  audioElement?: HTMLAudioElement | null;
}

export function Equalizer({ audioElement }: EqualizerProps) {
  const [bands, setBands] = useState<EqualizerBand[]>(equalizerService.getBands());
  const [currentPreset, setCurrentPreset] = useState(equalizerService.getCurrentPreset());
  const [isOpen, setIsOpen] = useState(false);

  // Conecta o equalizador quando o elemento de áudio estiver disponível
  useEffect(() => {
    if (audioElement && isOpen) {
      equalizerService.connect(audioElement);
    }
  }, [audioElement, isOpen]);

  // Atualiza o estado local quando o serviço muda
  const refreshState = () => {
    setBands(equalizerService.getBands());
    setCurrentPreset(equalizerService.getCurrentPreset());
  };

  /**
   * Atualiza o ganho de uma banda
   */
  const handleBandChange = (index: number, value: number[]) => {
    equalizerService.setBandGain(index, value[0]);
    refreshState();
  };

  /**
   * Aplica um preset selecionado
   */
  const handlePresetChange = (presetName: string) => {
    equalizerService.applyPreset(presetName);
    refreshState();
  };

  /**
   * Reseta para flat
   */
  const handleReset = () => {
    equalizerService.reset();
    refreshState();
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
        >
          <Sliders size={20} />
        </Button>
      </SheetTrigger>
      
      <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sliders size={20} className="text-primary" />
              Equalizador
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground"
            >
              <RotateCcw size={16} className="mr-1" />
              Reset
            </Button>
          </SheetTitle>
        </SheetHeader>

        {/* Preset Selector */}
        <div className="mb-8">
          <label className="text-sm text-muted-foreground mb-2 block">
            Preset
          </label>
          <Select value={currentPreset} onValueChange={handlePresetChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um preset" />
            </SelectTrigger>
            <SelectContent>
              {EQUALIZER_PRESETS.map((preset) => (
                <SelectItem key={preset.name} value={preset.name}>
                  {preset.name}
                </SelectItem>
              ))}
              {currentPreset === 'Custom' && (
                <SelectItem value="Custom">Custom</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Equalizer Bands */}
        <div className="flex justify-between items-end gap-2 h-48 px-4">
          {bands.map((band, index) => (
            <motion.div
              key={band.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex flex-col items-center gap-2 flex-1"
            >
              {/* Gain Value */}
              <span className="text-xs font-mono text-muted-foreground">
                {band.gain > 0 ? '+' : ''}{band.gain}dB
              </span>
              
              {/* Vertical Slider */}
              <div className="h-32 flex items-center justify-center">
                <Slider
                  orientation="vertical"
                  value={[band.gain]}
                  min={-12}
                  max={12}
                  step={1}
                  onValueChange={(value) => handleBandChange(index, value)}
                  className="h-full"
                />
              </div>
              
              {/* Frequency Label */}
              <span className="text-xs text-muted-foreground">
                {band.label}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Visual EQ Curve */}
        <div className="mt-8 h-16 bg-secondary/30 rounded-xl overflow-hidden relative">
          <svg 
            className="w-full h-full" 
            viewBox="0 0 100 40"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="eqGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.5" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            <line x1="0" y1="20" x2="100" y2="20" stroke="hsl(var(--muted))" strokeWidth="0.5" strokeDasharray="2,2" />
            
            {/* EQ Curve */}
            <motion.path
              d={generateEQPath(bands)}
              fill="url(#eqGradient)"
              stroke="hsl(var(--primary))"
              strokeWidth="1.5"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5 }}
            />
          </svg>
        </div>

        {/* Info */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Ajuste as frequências para personalizar o som
        </p>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Gera o path SVG para a curva do equalizador
 */
function generateEQPath(bands: EqualizerBand[]): string {
  const points = bands.map((band, index) => {
    const x = (index / (bands.length - 1)) * 100;
    // Converte ganho (-12 a +12) para Y (0 a 40), invertido
    const y = 20 - (band.gain / 12) * 15;
    return { x, y };
  });

  // Cria curva suave usando quadratic bezier
  let path = `M 0 ${points[0].y}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const current = points[i];
    const next = points[i + 1];
    const midX = (current.x + next.x) / 2;
    
    path += ` Q ${current.x} ${current.y} ${midX} ${(current.y + next.y) / 2}`;
  }
  
  path += ` L 100 ${points[points.length - 1].y}`;
  path += ' L 100 40 L 0 40 Z';
  
  return path;
}
