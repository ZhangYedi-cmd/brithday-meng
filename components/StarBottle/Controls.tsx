import React from 'react';
import { Button } from '../Shared';
import { Wind, Magnet } from 'lucide-react';

interface ControlsProps {
    onShake: () => void;
    canShake: boolean;
    shakeCooldown: number;
    
    isVacuuming: boolean;
    canVacuum: boolean;
    vacuumCooldown: number;
    onVacuumStart: () => void;
    onVacuumEnd: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
    onShake, canShake, shakeCooldown,
    isVacuuming, canVacuum, vacuumCooldown, onVacuumStart, onVacuumEnd
}) => {
    return (
        <div className="grid grid-cols-2 gap-4">
            <Button 
                variant="secondary" 
                disabled={!canVacuum}
                onMouseDown={onVacuumStart}
                onMouseUp={onVacuumEnd}
                onTouchStart={onVacuumStart}
                onTouchEnd={onVacuumEnd}
                className={`transition-all ${isVacuuming ? 'scale-95 bg-gold-400/20 border-gold-400' : ''}`}
            >
                <Magnet size={18} className={isVacuuming ? 'animate-bounce' : ''} />
                <span className="text-sm">
                    {canVacuum ? (isVacuuming ? '吸星中...' : '长按吸星') : `${vacuumCooldown}s`}
                </span>
            </Button>

            <Button 
                variant="secondary" 
                disabled={!canShake} 
                onClick={onShake}
            >
                <Wind size={18} />
                <span className="text-sm">
                    {canShake ? '轻轻一摇' : `${shakeCooldown}s`}
                </span>
            </Button>
        </div>
    );
};
