import React, { useEffect, useRef } from 'react';
import { getIngredientSprite, getKnifeSprite } from '../game/pixelSprites';
import { BowlDef, CuttingBoardDef, KnifeDef } from '../game/types';

interface PixelIngredientIconProps {
  id: string;
  size?: number;
  className?: string;
  locked?: boolean;
}

export const PixelIngredientIcon: React.FC<PixelIngredientIconProps> = ({
  id,
  size = 36,
  className = '',
  locked = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sprite = getIngredientSprite(id);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (locked) {
      ctx.filter = 'brightness(0.15) contrast(1.2)';
    } else {
      ctx.filter = 'none';
    }
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [id, locked]);

  return (
    <canvas
      ref={canvasRef}
      width={16}
      height={16}
      style={{ width: size, height: size }}
      className={`pixelated shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
};

interface PixelKnifeIconProps {
  knife: KnifeDef;
  size?: number;
  className?: string;
}

export const PixelKnifeIcon: React.FC<PixelKnifeIconProps> = ({
  knife,
  size = 44,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const sprite = getKnifeSprite(knife);
    ctx.imageSmoothingEnabled = false;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(sprite, 0, 0, canvas.width, canvas.height);
  }, [knife]);

  return (
    <canvas
      ref={canvasRef}
      width={24}
      height={12}
      style={{ width: size, height: size * 0.5 }}
      className={`pixelated shrink-0 ${className}`}
      aria-hidden="true"
    />
  );
};

interface PixelBoardIconProps {
  board: CuttingBoardDef;
  size?: number;
  className?: string;
}

export const PixelBoardIcon: React.FC<PixelBoardIconProps> = ({
  board,
  size = 34,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 24 18"
      width={size}
      height={Math.round(size * 0.75)}
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {/* Handle outline & fill */}
      <rect x="19" y="5" width="4" height="8" fill="#3B2314" />
      <rect x="19" y="6" width="3" height="6" fill={board.handleColor} />
      <rect x="20" y="8" width="1" height="2" fill="#3B2314" />

      {/* Board dark border */}
      <rect x="1" y="2" width="18" height="14" fill="#3B2314" />
      {/* Board main body */}
      <rect x="2" y="3" width="16" height="12" fill={board.woodColor} />
      {/* Top specular strip */}
      <rect x="2" y="3" width="16" height="1" fill="#FFFFFF" opacity="0.35" />
      {/* Juice groove */}
      <rect x="3" y="4" width="14" height="10" fill="none" stroke={board.grooveColor} strokeWidth="1" />
      {/* Corner pegs */}
      <rect x="2" y="3" width="1" height="1" fill={board.pegColor} />
      <rect x="17" y="3" width="1" height="1" fill={board.pegColor} />
      <rect x="2" y="14" width="1" height="1" fill={board.pegColor} />
      <rect x="17" y="14" width="1" height="1" fill={board.pegColor} />

      {/* Style accents */}
      {board.style === 'bamboo' && (
        <>
          <rect x="6" y="4" width="1" height="10" fill={board.grainColor} />
          <rect x="10" y="4" width="1" height="10" fill={board.grainColor} />
          <rect x="14" y="4" width="1" height="10" fill={board.grainColor} />
          <rect x="6" y="7" width="1" height="1" fill={board.pegColor} />
          <rect x="10" y="10" width="1" height="1" fill={board.pegColor} />
          <rect x="14" y="6" width="1" height="1" fill={board.pegColor} />
        </>
      )}
      {board.style === 'woven' && (
        <>
          <rect x="4" y="5" width="2" height="2" fill={board.grainColor} />
          <rect x="8" y="5" width="2" height="2" fill={board.grainColor} />
          <rect x="12" y="5" width="2" height="2" fill={board.grainColor} />
          <rect x="6" y="8" width="2" height="2" fill={board.grainColor} />
          <rect x="10" y="8" width="2" height="2" fill={board.grainColor} />
          <rect x="14" y="8" width="2" height="2" fill={board.grainColor} />
          <rect x="4" y="11" width="2" height="2" fill={board.grainColor} />
          <rect x="8" y="11" width="2" height="2" fill={board.grainColor} />
          <rect x="12" y="11" width="2" height="2" fill={board.grainColor} />
        </>
      )}
      {board.style === 'basalt' && (
        <>
          <rect x="5" y="6" width="2" height="1" fill={board.grainColor} />
          <rect x="11" y="5" width="3" height="2" fill={board.grainColor} />
          <rect x="7" y="10" width="2" height="2" fill="#9CA3AF" />
          <rect x="13" y="11" width="2" height="1" fill={board.grainColor} />
        </>
      )}
      {board.style === 'marble' && (
        <>
          <rect x="5" y="6" width="4" height="1" fill={board.grainColor} />
          <rect x="8" y="7" width="3" height="1" fill={board.grainColor} />
          <rect x="10" y="10" width="5" height="1" fill={board.grainColor} />
        </>
      )}
      {board.style === 'sakura' && (
        <>
          <rect x="4" y="5" width="2" height="2" fill="#F472B6" />
          <rect x="14" y="11" width="2" height="2" fill="#F472B6" />
          <rect x="5" y="9" width="8" height="1" fill={board.grainColor} />
        </>
      )}
      {board.style === 'carved_teak' && (
        <>
          <rect x="4" y="5" width="2" height="2" fill="#FACC15" />
          <rect x="14" y="5" width="2" height="2" fill="#FACC15" />
          <rect x="4" y="11" width="2" height="2" fill="#FACC15" />
          <rect x="14" y="11" width="2" height="2" fill="#FACC15" />
          <rect x="9" y="8" width="2" height="2" fill="#F59E0B" />
        </>
      )}
      {board.style === 'obsidian' && (
        <>
          <rect x="5" y="6" width="3" height="1" fill="#F97316" />
          <rect x="7" y="7" width="2" height="2" fill="#FB7185" />
          <rect x="11" y="10" width="4" height="1" fill="#F97316" />
          <rect x="13" y="8" width="1" height="2" fill="#FACC15" />
        </>
      )}
      {board.style === 'royal_gold' && (
        <>
          <rect x="4" y="5" width="12" height="8" fill="none" stroke="#FEF08A" strokeWidth="1" />
          <rect x="9" y="8" width="2" height="2" fill="#FEF08A" />
        </>
      )}
      {board.style === 'carbon_tech' && (
        <>
          <rect x="5" y="6" width="2" height="2" fill={board.grainColor} />
          <rect x="9" y="6" width="2" height="2" fill={board.grainColor} />
          <rect x="13" y="6" width="2" height="2" fill={board.grainColor} />
          <rect x="7" y="9" width="2" height="2" fill={board.grainColor} />
          <rect x="11" y="9" width="2" height="2" fill={board.grainColor} />
          <rect x="15" y="4" width="1" height="10" fill="#38BDF8" />
        </>
      )}
      {board.style === 'cyber_grid' && (
        <>
          <rect x="4" y="6" width="12" height="1" fill="#164E63" />
          <rect x="4" y="11" width="12" height="1" fill="#164E63" />
          <rect x="9" y="4" width="1" height="10" fill="#22D3EE" />
          <rect x="14" y="5" width="2" height="2" fill="#EC4899" />
          <rect x="4" y="11" width="2" height="2" fill="#EC4899" />
        </>
      )}
      {board.style === 'quantum_holo' && (
        <>
          <rect x="4" y="5" width="12" height="8" fill="none" stroke="#4ADE80" strokeWidth="1" />
          <rect x="9" y="5" width="2" height="8" fill="#38BDF8" opacity="0.6" />
          <rect x="6" y="8" width="8" height="2" fill="#C084FC" opacity="0.8" />
          <rect x="9" y="8" width="2" height="2" fill="#FFFFFF" />
        </>
      )}
      {board.style === 'oak' && (
        <>
          <rect x="5" y="6" width="6" height="1" fill={board.grainColor} />
          <rect x="9" y="11" width="6" height="1" fill={board.grainColor} />
        </>
      )}
    </svg>
  );
};

interface PixelBowlIconProps {
  bowl: BowlDef;
  size?: number;
  className?: string;
}

export const PixelBowlIcon: React.FC<PixelBowlIconProps> = ({
  bowl,
  size = 30,
  className = '',
}) => {
  return (
    <svg
      viewBox="0 0 20 20"
      width={size}
      height={size}
      shapeRendering="crispEdges"
      className={`shrink-0 ${className}`}
      aria-hidden="true"
    >
      {bowl.shape === 'square_bamboo' ? (
        <>
          <rect x="2" y="2" width="16" height="16" fill="#3B2314" />
          <rect x="3" y="3" width="14" height="14" fill={bowl.outerColor} />
          <rect x="5" y="5" width="10" height="10" fill={bowl.innerColor} />
          <rect x="5" y="5" width="10" height="2" fill={bowl.depthColor} />
          <rect x="3" y="3" width="2" height="2" fill={bowl.accentColor} />
          <rect x="15" y="3" width="2" height="2" fill={bowl.accentColor} />
          <rect x="3" y="15" width="2" height="2" fill={bowl.accentColor} />
          <rect x="15" y="15" width="2" height="2" fill={bowl.accentColor} />
        </>
      ) : bowl.shape === 'royal_chalice' ? (
        <>
          {/* Left & right chalice ears */}
          <rect x="0" y="7" width="3" height="6" fill="#3B2314" />
          <rect x="1" y="8" width="2" height="4" fill={bowl.outerColor} />
          <rect x="17" y="7" width="3" height="6" fill="#3B2314" />
          <rect x="17" y="8" width="2" height="4" fill={bowl.outerColor} />
          {/* Main round chalice */}
          <rect x="2" y="4" width="16" height="12" fill="#3B2314" />
          <rect x="4" y="2" width="12" height="16" fill="#3B2314" />
          <rect x="3" y="5" width="14" height="10" fill={bowl.outerColor} />
          <rect x="5" y="3" width="10" height="14" fill={bowl.outerColor} />
          <rect x="5" y="6" width="10" height="8" fill={bowl.innerColor} />
          <rect x="6" y="5" width="8" height="10" fill={bowl.innerColor} />
          <rect x="6" y="5" width="8" height="2" fill={bowl.depthColor} />
          {/* Ruby gems */}
          <rect x="9" y="3" width="2" height="2" fill={bowl.accentColor} />
          <rect x="9" y="15" width="2" height="2" fill={bowl.accentColor} />
        </>
      ) : bowl.shape === 'crystal' || bowl.shape === 'jade' ? (
        <>
          {/* Octagonal / faceted outline */}
          <rect x="5" y="2" width="10" height="16" fill="#3B2314" />
          <rect x="2" y="5" width="16" height="10" fill="#3B2314" />
          <rect x="3" y="3" width="14" height="14" fill="#3B2314" />
          <rect x="6" y="3" width="8" height="14" fill={bowl.outerColor} />
          <rect x="3" y="6" width="14" height="8" fill={bowl.outerColor} />
          <rect x="4" y="4" width="12" height="12" fill={bowl.outerColor} />
          <rect x="5" y="5" width="10" height="10" fill={bowl.innerColor} />
          <rect x="6" y="5" width="8" height="2" fill={bowl.depthColor} />
          <rect x="4" y="4" width="3" height="1" fill={bowl.accentColor} />
          <rect x="4" y="4" width="1" height="3" fill={bowl.accentColor} />
        </>
      ) : (
        <>
          {/* Round ceramic or lacquer bowl */}
          <rect x="2" y="4" width="16" height="12" fill="#3B2314" />
          <rect x="4" y="2" width="12" height="16" fill="#3B2314" />
          <rect x="3" y="5" width="14" height="10" fill={bowl.outerColor} />
          <rect x="5" y="3" width="10" height="14" fill={bowl.outerColor} />
          <rect x="5" y="6" width="10" height="8" fill={bowl.innerColor} />
          <rect x="6" y="5" width="8" height="10" fill={bowl.innerColor} />
          <rect x="6" y="5" width="8" height="2" fill={bowl.depthColor} />
          {bowl.shape === 'lacquer' ? (
            <>
              <rect x="5" y="5" width="10" height="1" fill={bowl.accentColor} />
              <rect x="5" y="14" width="10" height="1" fill={bowl.accentColor} />
            </>
          ) : (
            <rect x="5" y="4" width="4" height="1" fill="#FFFFFF" opacity="0.7" />
          )}
        </>
      )}
    </svg>
  );
};
