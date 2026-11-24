import { KitchenZoneDef } from './types';

export interface ZoneDecorContext {
  ctx: CanvasRenderingContext2D;
  zone: KitchenZoneDef;
  width: number;
  height: number;
  boardX: number;
  boardY: number;
  boardW: number;
  boardH: number;
  potX: number;
  potY: number;
  hasLowerDeckSpace: boolean;
  ambientTime: number;
  feverActive: boolean;
}

/**
 * Renders subtle zone-specific tile inlays on top of the base checkerboard countertop.
 */
export function drawZoneTileAccents(
  ctx: CanvasRenderingContext2D,
  zoneId: string,
  width: number,
  height: number,
  tileSize: number,
  ambientTime: number,
  feverActive: boolean
): void {
  if (!feverActive) {
    for (let ty = 0; ty < height; ty += tileSize) {
      for (let tx = 0; tx < width; tx += tileSize) {
        const ix = Math.floor(tx / tileSize);
        const iy = Math.floor(ty / tileSize);
        const checker = (ix + iy) % 2 === 0;

        if (zoneId === 'dapur_rumah' && (ix + iy) % 3 === 0) {
          // Warm home tile subtle corner diamond accents
          ctx.fillStyle = 'rgba(217, 158, 100, 0.2)';
          ctx.fillRect(tx + tileSize - 6, ty + tileSize - 6, 6, 6);
          if (checker) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.fillRect(tx + 8, ty + 8, 6, 3);
          }
        } else if (zoneId === 'kedai_pasar' && checker && (ix + iy) % 4 === 0) {
          // Subtle woven bamboo slat notches on alternating market tiles
          ctx.fillStyle = 'rgba(22, 163, 74, 0.12)';
          ctx.fillRect(tx + 8, ty + 14, 14, 3);
          ctx.fillRect(tx + 32, ty + 38, 14, 3);
        } else if (zoneId === 'bistro_sakura' && !checker && (ix * 3 + iy) % 5 === 0) {
          // Delicate fallen sakura petal specks on select bistro tiles
          ctx.fillStyle = 'rgba(244, 114, 182, 0.35)';
          ctx.fillRect(tx + 18, ty + 20, 6, 4);
          ctx.fillRect(tx + 34, ty + 36, 4, 4);
        } else if (zoneId === 'dapur_api' && (ix * 5 + iy * 3) % 7 === 0) {
          // Subtle glowing volcanic stone fissures
          const glow = 0.22 + Math.sin(ambientTime * 2.5 + ix + iy) * 0.08;
          ctx.fillStyle = `rgba(249, 115, 22, ${glow.toFixed(2)})`;
          ctx.fillRect(tx + 12, ty + 26, 16, 2);
          ctx.fillRect(tx + 24, ty + 26, 2, 12);
        } else if (zoneId === 'istana_emas') {
          // Royal golden corner diamond inlays at tile intersections
          ctx.fillStyle = 'rgba(212, 175, 55, 0.45)';
          ctx.fillRect(tx + tileSize - 5, ty + tileSize - 5, 6, 6);
          if (checker && (ix + iy) % 4 === 0) {
            ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
            ctx.fillRect(tx + 24, ty + 24, 8, 8);
          }
        }
      }
    }
  }

  // Perimeter countertop trim molding framing the kitchen workspace
  const trimColor =
    zoneId === 'kedai_pasar'
      ? '#65A30D'
      : zoneId === 'bistro_sakura'
        ? '#4C1D95'
        : zoneId === 'dapur_api'
          ? '#7C2D12'
          : zoneId === 'istana_emas'
            ? '#D4AF37'
            : '#A8663B';
  const trimHighlight =
    zoneId === 'istana_emas'
      ? '#FEF08A'
      : zoneId === 'dapur_api'
        ? '#F97316'
        : zoneId === 'bistro_sakura'
          ? '#F9A8D4'
          : 'rgba(255, 255, 255, 0.28)';

  ctx.fillStyle = '#3B2314';
  ctx.fillRect(0, 0, width, 10);
  ctx.fillRect(0, height - 10, width, 10);
  ctx.fillStyle = trimColor;
  ctx.fillRect(0, 0, width, 7);
  ctx.fillRect(0, height - 7, width, 7);
  ctx.fillStyle = trimHighlight;
  ctx.fillRect(0, 2, width, 2);
  ctx.fillRect(0, height - 7, width, 2);
}

/**
 * Renders top-down pixel-art perimeter kitchen props tailored to the active kitchen zone.
 */
export function drawZoneDecorations(params: ZoneDecorContext): void {
  const {
    ctx,
    zone,
    width,
    height,
    boardX,
    boardY,
    boardW,
    boardH,
    potX,
    potY,
    hasLowerDeckSpace,
    ambientTime,
  } = params;
  const zId = zone.id;
  const zTheme = zone.theme;

  const propLeftX = 56;
  const propTopY = Math.max(96, boardY - 64);
  const sway = Math.round(Math.sin(ambientTime * 2.4) * 2);

  // ================= UPPER PERIMETER COUNTER =================
  if (propTopY > 82) {
    // --- A. Upper-Left Condiment Trio ---
    drawCondimentTrio(ctx, zId, propLeftX, propTopY);

    // --- B. Upper-Left-Center Signature Prop ---
    const leftCenterX = Math.max(212, boardX + 24);
    if (leftCenterX + 74 < boardX + boardW - 110 && propTopY > 94) {
      drawUpperLeftCenterProp(ctx, zId, leftCenterX, propTopY, ambientTime);
    }

    // --- B2. Upper-Middle Feature Prop (Recipe Book / Market Scale / Tea & Lantern / Grill Sauce / Candelabra) ---
    const midTopX = Math.round(boardX + boardW * 0.46);
    if (midTopX - 32 > leftCenterX + 34 && midTopX + 36 < boardX + boardW - 134 && propTopY > 94) {
      drawUpperCenterProp(ctx, zId, midTopX, propTopY, ambientTime);
    }

    // --- C. Upper-Right-Center Signature Tray ---
    const rightTrayX = boardX + boardW - 86;
    if (boardW >= 320 && propTopY > 94) {
      drawUpperRightTray(ctx, zId, rightTrayX, propTopY);
    }

    // --- D. Upper-Right Corner Potted Plant / Bonsai ---
    const cornerPlantX = width - 58;
    if (cornerPlantX - 28 > rightTrayX + 54 && propTopY > 92) {
      drawCornerPlant(ctx, zId, cornerPlantX, propTopY, sway);
    }

    // --- D2. Upper-Right Side Prep Block (between Right Tray & Corner Plant) ---
    const sidePrepX = Math.round((rightTrayX + 54 + (cornerPlantX - 28)) * 0.5);
    if (cornerPlantX - 28 - (rightTrayX + 54) >= 68 && propTopY > 94) {
      drawUpperRightSideProp(ctx, zId, sidePrepX, propTopY);
    }
  }

  // ================= RIGHT FLANK PREP ACCESSORY ABOVE/BELOW BELT =================
  const rightFlankX = width - 56;
  if (rightFlankX - 28 > boardX + boardW + 38) {
    if (boardY + 26 < height * 0.56 - 62) {
      drawSideOilCruets(ctx, zId, rightFlankX, boardY + 14);
    }
  }

  // ================= LOWER-LEFT POT & UTENSIL =================
  if (hasLowerDeckSpace) {
    drawSimmeringPot(ctx, zId, zTheme.potBroth, zTheme.potBubble, potX, potY, ambientTime);

    if (width >= 520) {
      drawPotCompanionUtensil(ctx, zId, potX + 64, potY + 4);
    }
  }

  // ================= LOWER-CENTER SIGNATURE ZONE DISH / WORKSTATION =================
  if (hasLowerDeckSpace) {
    const lowerMidX = Math.round(boardX + boardW * 0.44);
    const clothX = width - 130;
    if (lowerMidX - 44 > potX + 94 && lowerMidX + 44 < clothX - 130) {
      drawLowerCenterDish(ctx, zId, lowerMidX, potY, ambientTime);
    }
  }

  // ================= LOWER-RIGHT CLOTH / MAT, TOOL, DRINK & TIMER =================
  const clothX = width - 130;
  const clothY = Math.min(height - 96, boardY + boardH + 22);
  if (clothY + 64 < height) {
    drawLowerRightMatAndTool(ctx, zId, zTheme.clothColor, clothX, clothY);

    if (hasLowerDeckSpace && clothX - 118 > potX + 112) {
      drawZoneDrink(ctx, zId, clothX - 46, potY + 2, ambientTime);
      drawZoneTimer(ctx, zId, clothX - 102, potY, ambientTime);
    }
  }
}

function drawCondimentTrio(
  ctx: CanvasRenderingContext2D,
  zId: string,
  baseX: number,
  y: number
): void {
  const colors =
    zId === 'kedai_pasar'
      ? ['#EF4444', '#84CC16', '#F59E0B']
      : zId === 'bistro_sakura'
        ? ['#2B1D14', '#4ADE80', '#F9A8D4'] // Shoyu, Wasabi, Gari
        : zId === 'dapur_api'
          ? ['#DC2626', '#F97316', '#7F1D1D'] // Chili oil, cayenne, roasted garlic
          : zId === 'istana_emas'
            ? ['#FACC15', '#9333EA', '#E11D48'] // Saffron, truffle, berry glaze
            : ['#EF3E36', '#2ECC40', '#D97706'];

  colors.forEach((sc, idx) => {
    const sx = baseX + idx * 46;
    ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
    ctx.fillRect(sx - 15, y - 12, 34, 34);

    if (zId === 'kedai_pasar') {
      // Fresh green banana-leaf square dishes
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(sx - 18, y - 18, 36, 36);
      ctx.fillStyle = '#15803D';
      ctx.fillRect(sx - 14, y - 14, 28, 28);
      ctx.fillStyle = sc;
      ctx.fillRect(sx - 9, y - 9, 18, 18);
    } else if (zId === 'bistro_sakura') {
      // Dark black lacquer rectangular sushi dip plates
      ctx.fillStyle = '#1E1B2E';
      ctx.fillRect(sx - 18, y - 16, 36, 32);
      ctx.fillStyle = '#4C1D95';
      ctx.fillRect(sx - 15, y - 13, 30, 26);
      ctx.fillStyle = sc;
      ctx.fillRect(sx - 10, y - 8, 20, 16);
    } else if (zId === 'dapur_api') {
      // Dark iron ramekins
      ctx.fillStyle = '#1C1917';
      ctx.fillRect(sx - 18, y - 18, 36, 36);
      ctx.fillStyle = '#57534E';
      ctx.fillRect(sx - 14, y - 14, 28, 28);
      ctx.fillStyle = sc;
      ctx.fillRect(sx - 10, y - 10, 20, 20);
    } else if (zId === 'istana_emas') {
      // Gold-rimmed royal porcelain dishes
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(sx - 18, y - 18, 36, 36);
      ctx.fillStyle = '#FACC15';
      ctx.fillRect(sx - 15, y - 15, 30, 30);
      ctx.fillStyle = '#FFFDF5';
      ctx.fillRect(sx - 12, y - 12, 24, 24);
      ctx.fillStyle = sc;
      ctx.fillRect(sx - 8, y - 8, 16, 16);
    } else {
      // Home ceramic square bowls
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(sx - 18, y - 18, 36, 36);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(sx - 14, y - 14, 28, 28);
      ctx.fillStyle = sc;
      ctx.fillRect(sx - 10, y - 10, 20, 20);
    }
  });
}

function drawUpperLeftCenterProp(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(x - 24, y - 14, 52, 36);

  if (zId === 'kedai_pasar') {
    // Wooden Market Produce Crate packed with fresh greens, oranges & radishes
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 28, y - 18, 56, 36);
    ctx.fillStyle = '#C88A4B';
    ctx.fillRect(x - 24, y - 14, 48, 28);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(x - 20, y - 10, 40, 20);
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(x - 18, y - 8, 12, 10);
    ctx.fillStyle = '#FB923C';
    ctx.fillRect(x - 4, y - 9, 12, 12);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 10, y - 7, 9, 10);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 10, y + 2, 14, 7);
  } else if (zId === 'bistro_sakura') {
    // Bamboo Sushi Makisu Mat with fresh Maki Rolls
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 28, y - 17, 56, 34);
    ctx.fillStyle = '#E5C99E';
    ctx.fillRect(x - 24, y - 13, 48, 26);
    ctx.fillStyle = '#CFA976';
    for (let sx = -18; sx <= 18; sx += 8) {
      ctx.fillRect(x + sx, y - 13, 2, 26);
    }
    // 3 Sushi maki rolls on the mat
    [-14, 0, 14].forEach((mx) => {
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(x + mx - 5, y - 6, 10, 12);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + mx - 3, y - 4, 6, 8);
      ctx.fillStyle = '#FF6B4A';
      ctx.fillRect(x + mx - 1, y - 2, 3, 4);
    });
  } else if (zId === 'dapur_api') {
    // Glowing Charcoal Brazier Grill Rack
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(x - 28, y - 18, 56, 36);
    ctx.fillStyle = '#44403C';
    ctx.fillRect(x - 24, y - 14, 48, 28);
    // Pulsing hot embers beneath grate
    const pulse = Math.sin(ambientTime * 6) > 0;
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x - 20, y - 10, 40, 20);
    ctx.fillStyle = pulse ? '#F97316' : '#EF4444';
    ctx.fillRect(x - 16, y - 6, 12, 8);
    ctx.fillRect(x + 4, y - 4, 12, 8);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 12, y - 4, 4, 4);
    ctx.fillRect(x + 8, y - 2, 4, 4);
    // Steel grill bars across top
    ctx.fillStyle = '#94A3B8';
    for (let gx = -18; gx <= 18; gx += 9) {
      ctx.fillRect(x + gx, y - 12, 2, 24);
    }
  } else if (zId === 'istana_emas') {
    // Royal Golden Platter with Saffron, Crown Fruit & Truffles
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 28, y - 18, 56, 36);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 24, y - 14, 48, 28);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x - 20, y - 10, 40, 20);
    // Royal garnish items
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(x - 15, y - 6, 12, 12);
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(x + 1, y - 7, 10, 10);
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(x + 10, y - 2, 8, 8);
  } else {
    // Dapur Rumah: Woven Mise-en-Place Basket (Lime, Shallot, Garlic, Chili)
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 26, y - 18, 52, 36);
    ctx.fillStyle = '#D49A60';
    ctx.fillRect(x - 22, y - 14, 44, 28);
    ctx.fillStyle = '#A66E38';
    ctx.fillRect(x - 18, y - 10, 36, 20);
    ctx.fillStyle = '#65A30D';
    ctx.fillRect(x - 15, y - 8, 12, 12);
    ctx.fillStyle = '#A3E635';
    ctx.fillRect(x - 13, y - 6, 6, 6);
    ctx.fillStyle = '#C026D3';
    ctx.fillRect(x + 1, y - 9, 12, 10);
    ctx.fillStyle = '#FFFBF2';
    ctx.fillRect(x - 4, y + 1, 12, 9);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x + 8, y - 2, 8, 10);
  }
}

function drawUpperRightTray(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(x - 42, y - 12, 90, 34);

  if (zId === 'kedai_pasar') {
    // Traditional Stone Cobek & Ulekan (Mortar & Pestle with Chili Sambal)
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 32, y - 18, 52, 36);
    ctx.fillStyle = '#64748B';
    ctx.fillRect(x - 28, y - 14, 44, 28);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 22, y - 10, 32, 20);
    // Crushed red chili & lime inside cobek
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 16, y - 6, 18, 12);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 10, y - 3, 4, 4);
    // Wooden/stone pestle handle
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 2, y - 4, 28, 10);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(x, y - 2, 24, 6);
  } else if (zId === 'bistro_sakura') {
    // Hinoki Tray with Sake Tokkuri Flask & Two Ochoko Cups
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 44, y - 16, 88, 32);
    ctx.fillStyle = '#E5C99E';
    ctx.fillRect(x - 40, y - 12, 80, 24);
    // Sake flask
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 32, y - 10, 20, 20);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x - 29, y - 7, 14, 14);
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x - 25, y - 3, 6, 6);
    // Two small ochoko cups
    [4, 24].forEach((ox) => {
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(x + ox - 7, y - 7, 14, 14);
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + ox - 5, y - 5, 10, 10);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(x + ox - 3, y - 3, 6, 6);
    });
  } else if (zId === 'dapur_api') {
    // Dark Steel BBQ Spice Rack with 4 Metal Shakers
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x - 46, y - 16, 92, 32);
    ctx.fillStyle = '#3F3F46';
    ctx.fillRect(x - 42, y - 12, 84, 24);
    const tins = ['#EF4444', '#F97316', '#27272A', '#E5E7EB'];
    tins.forEach((tc, idx) => {
      const jx = x - 38 + idx * 20;
      ctx.fillStyle = '#18181B';
      ctx.fillRect(jx, y - 9, 16, 18);
      ctx.fillStyle = tc;
      ctx.fillRect(jx + 2, y - 7, 12, 14);
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(jx + 5, y - 4, 6, 6);
    });
  } else if (zId === 'istana_emas') {
    // Ornate Gold-Trimmed Crystal Spice Cask
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 46, y - 16, 92, 32);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(x - 42, y - 12, 84, 24);
    const royalSpices = ['#FACC15', '#FB7185', '#C084FC', '#F8FAFC'];
    royalSpices.forEach((rs, idx) => {
      const jx = x - 38 + idx * 20;
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(jx, y - 9, 16, 18);
      ctx.fillStyle = rs;
      ctx.fillRect(jx + 2, y - 7, 12, 14);
      ctx.fillStyle = '#FEF08A';
      ctx.fillRect(jx + 5, y - 4, 6, 6);
    });
  } else {
    // Dapur Rumah: Wooden Spice Jar Tray
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 46, y - 16, 92, 32);
    ctx.fillStyle = '#A8663B';
    ctx.fillRect(x - 42, y - 12, 84, 24);
    const spiceColors = ['#DC2626', '#FACC15', '#16A34A', '#F8FAFC'];
    spiceColors.forEach((spc, idx) => {
      const jx = x - 38 + idx * 20;
      ctx.fillStyle = '#3B2314';
      ctx.fillRect(jx, y - 9, 16, 18);
      ctx.fillStyle = spc;
      ctx.fillRect(jx + 2, y - 7, 12, 14);
      ctx.fillStyle = '#CBD5E1';
      ctx.fillRect(jx + 5, y - 4, 6, 6);
    });
  }
}

function drawCornerPlant(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number,
  sway: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.22)';
  ctx.fillRect(x - 18, y - 14, 40, 38);

  if (zId === 'bistro_sakura') {
    // Mini Bonsai Sakura Tree in Dark Ceramic Pot
    ctx.fillStyle = '#1E1B2E';
    ctx.fillRect(x - 20, y - 18, 40, 36);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 16, y - 14, 32, 28);
    ctx.fillStyle = '#5C3A21';
    ctx.fillRect(x - 10, y - 10, 20, 20);
    // Blossoming pink canopy
    ctx.fillStyle = '#DB2777';
    ctx.fillRect(x - 16 + sway, y - 12, 30, 22);
    ctx.fillStyle = '#F9A8D4';
    ctx.fillRect(x - 12 + sway, y - 16, 22, 26);
    ctx.fillStyle = '#FCE7F3';
    ctx.fillRect(x - 6 + sway, y - 8, 10, 8);
  } else if (zId === 'dapur_api') {
    // Fiery Potted Chili Plant with Red Peppers
    ctx.fillStyle = '#1C1917';
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.fillStyle = '#7C2D12';
    ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.fillStyle = '#292524';
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.fillStyle = '#15803D';
    ctx.fillRect(x - 15 + sway, y - 8, 30, 14);
    ctx.fillRect(x - 7 + sway, y - 16, 14, 30);
    // Bright red chili fruits
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 12 + sway, y - 10, 6, 8);
    ctx.fillRect(x + 6 + sway, y + 2, 6, 8);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x + 2 + sway, y - 8, 4, 4);
  } else if (zId === 'istana_emas') {
    // Golden Royal Laurel Topiary
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.fillStyle = '#4C1D95';
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.fillStyle = '#15803D';
    ctx.fillRect(x - 14 + sway, y - 14, 28, 28);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 8 + sway, y - 8, 16, 16);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x - 4 + sway, y - 4, 8, 8);
  } else {
    // Dapur Rumah & Kedai Pasar: Terracotta Potted Kitchen Herb (Basil / Pandan)
    const rim = zId === 'kedai_pasar' ? '#CA8A04' : '#EA580C';
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 20, y - 20, 40, 40);
    ctx.fillStyle = rim;
    ctx.fillRect(x - 16, y - 16, 32, 32);
    ctx.fillStyle = '#5C3A21';
    ctx.fillRect(x - 12, y - 12, 24, 24);
    ctx.fillStyle = '#15803D';
    ctx.fillRect(x - 16 + sway, y - 8, 14, 10);
    ctx.fillRect(x + 2 + sway, y - 4, 14, 10);
    ctx.fillRect(x - 6 + sway, y - 18, 12, 14);
    ctx.fillRect(x - 8 + sway, y + 4, 12, 14);
    ctx.fillStyle = '#4ADE80';
    ctx.fillRect(x - 12 + sway, y - 6, 8, 6);
    ctx.fillRect(x + 4 + sway, y - 2, 8, 6);
    ctx.fillRect(x - 4 + sway, y - 14, 6, 8);
    ctx.fillStyle = zId === 'kedai_pasar' ? '#BEF264' : '#FEF08A';
    ctx.fillRect(x - 2 + sway, y - 2, 4, 4);
  }
}

function drawSimmeringPot(
  ctx: CanvasRenderingContext2D,
  zId: string,
  potBroth: string,
  potBubble: string,
  potX: number,
  potY: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.22)';
  ctx.fillRect(potX - 28, potY - 24, 62, 56);

  const metalLip =
    zId === 'kedai_pasar'
      ? '#D97706' // Brass kuali
      : zId === 'istana_emas'
        ? '#FACC15' // Gilded royal pot
        : zId === 'bistro_sakura'
          ? '#334155' // Cast-iron tetsubin
          : '#64748B';

  ctx.fillStyle = '#3B2314';
  ctx.fillRect(potX - 38, potY - 8, 12, 16);
  ctx.fillRect(potX + 26, potY - 8, 12, 16);
  if (zId === 'istana_emas') {
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(potX - 36, potY - 5, 8, 10);
    ctx.fillRect(potX + 28, potY - 5, 8, 10);
  }

  ctx.fillStyle = '#3B2314';
  ctx.fillRect(potX - 30, potY - 24, 60, 48);
  ctx.fillRect(potX - 24, potY - 30, 48, 60);
  ctx.fillStyle = metalLip;
  ctx.fillRect(potX - 26, potY - 20, 52, 40);
  ctx.fillRect(potX - 20, potY - 26, 40, 52);

  ctx.fillStyle = potBroth;
  ctx.fillRect(potX - 20, potY - 18, 40, 36);
  ctx.fillRect(potX - 16, potY - 22, 32, 44);

  const b1 = Math.sin(ambientTime * 5) > 0;
  ctx.fillStyle = potBubble;
  ctx.fillRect(potX + (b1 ? -10 : 6), potY + (b1 ? -6 : 4), 6, 6);
  ctx.fillRect(potX + (b1 ? 8 : -8), potY + (b1 ? 8 : -10), 4, 4);
}

function drawPotCompanionUtensil(
  ctx: CanvasRenderingContext2D,
  zId: string,
  sx: number,
  sy: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.16)';
  ctx.fillRect(sx - 10, sy - 20, 22, 42);

  if (zId === 'bistro_sakura') {
    // Pair of Wooden Chopsticks on Ceramic Rest
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(sx - 10, sy - 4, 22, 8);
    ctx.fillStyle = '#F9A8D4';
    ctx.fillRect(sx - 8, sy - 2, 18, 4);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(sx - 5, sy - 24, 4, 46);
    ctx.fillRect(sx + 3, sy - 24, 4, 46);
    ctx.fillStyle = '#F5DEB3';
    ctx.fillRect(sx - 4, sy - 22, 2, 42);
    ctx.fillRect(sx + 4, sy - 22, 2, 42);
  } else if (zId === 'dapur_api') {
    // Metal Grilling Tongs
    ctx.fillStyle = '#18181B';
    ctx.fillRect(sx - 8, sy - 22, 16, 42);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(sx - 5, sy - 20, 4, 34);
    ctx.fillRect(sx + 1, sy - 20, 4, 34);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(sx - 4, sy + 12, 8, 6);
  } else if (zId === 'istana_emas') {
    // Royal Silver & Gold Ladle
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(sx - 4, sy - 22, 8, 30);
    ctx.fillRect(sx - 10, sy + 4, 20, 16);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(sx - 2, sy - 20, 4, 26);
    ctx.fillRect(sx - 8, sy + 6, 16, 12);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(sx - 4, sy + 9, 8, 6);
  } else {
    // Dapur Rumah & Kedai Pasar: Resting Wooden Ladle / Strainer
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(sx - 4, sy - 22, 8, 30);
    ctx.fillRect(sx - 10, sy + 4, 20, 16);
    ctx.fillStyle = '#D99E64';
    ctx.fillRect(sx - 2, sy - 20, 4, 26);
    ctx.fillRect(sx - 8, sy + 6, 16, 12);
    ctx.fillStyle = zId === 'kedai_pasar' ? '#FDE68A' : '#A66E38';
    ctx.fillRect(sx - 4, sy + 9, 8, 6);
  }
}

function drawLowerRightMatAndTool(
  ctx: CanvasRenderingContext2D,
  zId: string,
  clothColor: string,
  clothX: number,
  clothY: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.18)';
  ctx.fillRect(clothX + 4, clothY + 4, 88, 64);
  ctx.fillStyle = '#3B2314';
  ctx.fillRect(clothX - 2, clothY - 2, 92, 68);

  if (zId === 'kedai_pasar') {
    // Fresh Banana Leaf Serving Mat with leaf ribs
    ctx.fillStyle = '#15803D';
    ctx.fillRect(clothX, clothY, 88, 64);
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(clothX + 4, clothY + 4, 80, 56);
    ctx.fillStyle = '#86EFAC';
    ctx.fillRect(clothX, clothY + 30, 88, 4);
    for (let rx = 12; rx < 80; rx += 16) {
      ctx.fillStyle = '#16A34A';
      ctx.fillRect(clothX + rx, clothY + 6, 3, 22);
      ctx.fillRect(clothX + rx + 4, clothY + 36, 3, 22);
    }
  } else if (zId === 'istana_emas') {
    // Royal Purple Velvet Runner with Golden Trim
    ctx.fillStyle = '#5B21B6';
    ctx.fillRect(clothX, clothY, 88, 64);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(clothX + 4, clothY + 4, 80, 56);
    ctx.fillStyle = '#7C3AED';
    ctx.fillRect(clothX + 8, clothY + 8, 72, 48);
  } else if (zId === 'dapur_api') {
    // Riveted Dark Heat-Resistant Leather Pad
    ctx.fillStyle = '#292524';
    ctx.fillRect(clothX, clothY, 88, 64);
    ctx.fillStyle = clothColor;
    ctx.fillRect(clothX + 6, clothY + 6, 76, 52);
    ctx.fillStyle = '#44403C';
    ctx.fillRect(clothX + 10, clothY + 10, 68, 44);
  } else {
    // Checkered Cloth (Home Red / Bistro Sakura Pink)
    for (let cy = 0; cy < 64; cy += 16) {
      for (let cx = 0; cx < 88; cx += 16) {
        const cEven = cx / 16 + cy / 16;
        ctx.fillStyle = cEven % 2 === 0 ? clothColor : '#FFFBF2';
        ctx.fillRect(clothX + cx, clothY + cy, Math.min(16, 88 - cx), 16);
      }
    }
  }

  // Signature Tool Resting on Mat
  const pinX = clothX + 14;
  const pinY = clothY + 24;
  ctx.fillStyle = 'rgba(59, 35, 20, 0.22)';
  ctx.fillRect(pinX + 2, pinY + 3, 60, 14);

  if (zId === 'bistro_sakura') {
    // Matcha Bamboo Whisk (Chasen) resting cleanly
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(pinX + 8, pinY + 1, 44, 14);
    ctx.fillStyle = '#D49A60';
    ctx.fillRect(pinX + 10, pinY + 3, 18, 10);
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(pinX + 28, pinY + 2, 22, 12);
    ctx.fillStyle = '#92400E';
    ctx.fillRect(pinX + 26, pinY + 3, 3, 10);
  } else if (zId === 'dapur_api') {
    // Heavy Iron Meat Tenderizer Hammer
    ctx.fillStyle = '#18181B';
    ctx.fillRect(pinX + 4, pinY + 4, 40, 8);
    ctx.fillRect(pinX + 38, pinY - 4, 18, 24);
    ctx.fillStyle = '#78350F';
    ctx.fillRect(pinX + 6, pinY + 6, 32, 4);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(pinX + 40, pinY - 2, 14, 20);
  } else if (zId === 'istana_emas') {
    // Gilded Royal Rolling Pin
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(pinX, pinY + 3, 60, 8);
    ctx.fillStyle = '#9333EA';
    ctx.fillRect(pinX + 2, pinY + 5, 56, 4);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(pinX + 10, pinY, 40, 14);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(pinX + 12, pinY + 2, 36, 10);
    ctx.fillStyle = '#FEF9C3';
    ctx.fillRect(pinX + 16, pinY + 4, 24, 2);
  } else {
    // Classic Wooden Rolling Pin
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(pinX, pinY + 3, 60, 8);
    ctx.fillStyle = '#8B4E24';
    ctx.fillRect(pinX + 2, pinY + 5, 56, 4);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(pinX + 10, pinY, 40, 14);
    ctx.fillStyle = '#E6B17A';
    ctx.fillRect(pinX + 12, pinY + 2, 36, 10);
    ctx.fillStyle = '#FFF8EC';
    ctx.fillRect(pinX + 16, pinY + 4, 24, 2);
  }
}

function drawZoneDrink(
  ctx: CanvasRenderingContext2D,
  zId: string,
  cupX: number,
  cupY: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(cupX - 16, cupY - 14, 36, 36);
  ctx.fillStyle = '#3B2314';
  ctx.fillRect(cupX - 18, cupY - 18, 36, 36);

  if (zId === 'istana_emas') {
    // Golden Royal Goblet
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(cupX - 14, cupY - 14, 28, 28);
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(cupX - 9, cupY - 9, 18, 18);
    ctx.fillStyle = '#FB7185';
    ctx.fillRect(cupX - 6, cupY - 6, 6, 4);
  } else if (zId === 'kedai_pasar') {
    // Glass of Fresh Iced Es Jeruk
    ctx.fillStyle = '#E0F2FE';
    ctx.fillRect(cupX - 14, cupY - 14, 28, 28);
    ctx.fillStyle = '#FF8C00';
    ctx.fillRect(cupX - 10, cupY - 10, 20, 20);
    // Floating ice cubes
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cupX - 6, cupY - 6, 6, 6);
    ctx.fillRect(cupX + 2, cupY, 5, 5);
  } else if (zId === 'bistro_sakura') {
    // Handleless Ceramic Yunomi Matcha Cup
    ctx.fillStyle = '#F5F5F4';
    ctx.fillRect(cupX - 14, cupY - 14, 28, 28);
    ctx.fillStyle = '#65A30D';
    ctx.fillRect(cupX - 9, cupY - 9, 18, 18);
    ctx.fillStyle = '#BEF264';
    ctx.fillRect(cupX - 6, cupY - 6, 6, 4);
  } else if (zId === 'dapur_api') {
    // Steel Mug with Frothy Spiced Brew
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cupX - 14, cupY - 14, 28, 28);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(cupX + 12, cupY - 5, 8, 10);
    ctx.fillStyle = '#94A3B8';
    ctx.fillRect(cupX + 12, cupY - 3, 6, 6);
    ctx.fillStyle = '#7C2D12';
    ctx.fillRect(cupX - 9, cupY - 9, 18, 18);
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(cupX - 6, cupY - 6, 8, 5);
  } else {
    // Home Warm Tea Mug on Saucer
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(cupX - 14, cupY - 14, 28, 28);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(cupX + 12, cupY - 5, 8, 10);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(cupX + 12, cupY - 3, 6, 6);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(cupX - 9, cupY - 9, 18, 18);
    ctx.fillStyle = '#FDE68A';
    ctx.fillRect(cupX - 6, cupY - 6, 6, 4);
  }

  // Tiny animated steam shimmer above warm drinks
  if (zId !== 'kedai_pasar') {
    const sy = cupY - 12 - (Math.floor(ambientTime * 3) % 4);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.fillRect(cupX - 2, sy, 4, 3);
  }
}

function drawZoneTimer(
  ctx: CanvasRenderingContext2D,
  zId: string,
  timerX: number,
  timerY: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(timerX - 14, timerY - 12, 32, 32);
  ctx.fillStyle = '#3B2314';
  ctx.fillRect(timerX - 16, timerY - 16, 32, 32);

  ctx.fillStyle =
    zId === 'istana_emas'
      ? '#FACC15'
      : zId === 'bistro_sakura'
        ? '#EC4899'
        : zId === 'kedai_pasar'
          ? '#16A34A'
          : zId === 'dapur_api'
            ? '#F97316'
            : '#EF4444';
  ctx.fillRect(timerX - 12, timerY - 12, 24, 24);
  ctx.fillStyle = '#FFFBF2';
  ctx.fillRect(timerX - 8, timerY - 8, 16, 16);

  const tickStep = Math.floor(ambientTime * 2) % 4;
  ctx.fillStyle = '#3B2314';
  ctx.fillRect(timerX - 1, timerY - 1, 3, 3);
  if (tickStep === 0) ctx.fillRect(timerX - 1, timerY - 6, 2, 6);
  else if (tickStep === 1) ctx.fillRect(timerX, timerY - 1, 6, 2);
  else if (tickStep === 2) ctx.fillRect(timerX - 1, timerY, 2, 6);
  else ctx.fillRect(timerX - 6, timerY - 1, 6, 2);
}

function drawUpperCenterProp(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(x - 24, y - 14, 52, 34);

  if (zId === 'kedai_pasar') {
    // Traditional Brass Market Scale Tray with Produce Weights
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 26, y - 14, 52, 28);
    ctx.fillStyle = '#CA8A04';
    ctx.fillRect(x - 22, y - 10, 44, 20);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 18, y - 7, 16, 14);
    ctx.fillRect(x + 4, y - 7, 14, 14);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 14, y - 4, 8, 8);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x + 8, y - 4, 6, 8);
  } else if (zId === 'bistro_sakura') {
    // Cast-Iron Kyusu Teapot + Warm Glowing Paper Andon Lantern
    ctx.fillStyle = '#1E1B2E';
    ctx.fillRect(x - 24, y - 14, 26, 26);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - 20, y - 10, 18, 18);
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x - 14, y - 4, 6, 6);
    // Lantern
    const glow = Math.sin(ambientTime * 4) > 0 ? '#FEF08A' : '#FDE047';
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x + 6, y - 14, 22, 26);
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(x + 9, y - 11, 16, 20);
    ctx.fillStyle = glow;
    ctx.fillRect(x + 13, y - 7, 8, 12);
  } else if (zId === 'dapur_api') {
    // BBQ Sauce Bottles & Heated Charcoal Iron Stamp
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x - 24, y - 14, 48, 28);
    ctx.fillStyle = '#57534E';
    ctx.fillRect(x - 21, y - 11, 42, 22);
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(x - 16, y - 8, 12, 16);
    ctx.fillStyle = '#F97316';
    ctx.fillRect(x + 2, y - 8, 12, 16);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 12, y - 4, 4, 4);
    ctx.fillRect(x + 6, y - 4, 4, 4);
  } else if (zId === 'istana_emas') {
    // Royal Golden 3-Flame Candelabra
    const flick = Math.sin(ambientTime * 8) > 0 ? '#FEF08A' : '#FB923C';
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 26, y - 12, 52, 24);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(x - 22, y - 8, 44, 16);
    [-14, 0, 14].forEach((cx) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + cx - 4, y - 4, 8, 8);
      ctx.fillStyle = flick;
      ctx.fillRect(x + cx - 2, y - 2, 4, 4);
    });
  } else {
    // Dapur Rumah: Open Kitchen Recipe Book with Red Bookmark
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 26, y - 16, 52, 32);
    ctx.fillStyle = '#B45309';
    ctx.fillRect(x - 23, y - 13, 46, 26);
    ctx.fillStyle = '#FFFDF5';
    ctx.fillRect(x - 20, y - 11, 18, 22);
    ctx.fillRect(x + 2, y - 11, 18, 22);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x - 16, y - 6, 10, 2);
    ctx.fillRect(x - 16, y, 12, 2);
    ctx.fillRect(x + 6, y - 6, 10, 2);
    ctx.fillRect(x + 6, y, 10, 2);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 1, y - 11, 3, 28);
  }
}

function drawUpperRightSideProp(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
  ctx.fillRect(x - 18, y - 12, 40, 32);
  ctx.fillStyle = '#3B2314';
  ctx.fillRect(x - 20, y - 16, 40, 32);

  if (zId === 'kedai_pasar') {
    // Bamboo Woven Basket Lid & Fresh Chili Bundle
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x - 16, y - 12, 32, 24);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 10, y - 6, 12, 6);
    ctx.fillStyle = '#22C55E';
    ctx.fillRect(x + 2, y - 2, 10, 6);
  } else if (zId === 'bistro_sakura') {
    // Stacked Black Lacquer Bento Box
    ctx.fillStyle = '#1E1B2E';
    ctx.fillRect(x - 16, y - 12, 32, 24);
    ctx.fillStyle = '#EC4899';
    ctx.fillRect(x - 12, y - 8, 24, 16);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 6, y - 2, 12, 4);
  } else if (zId === 'dapur_api') {
    // Spare Cast-Iron Skillet Pan
    ctx.fillStyle = '#27272A';
    ctx.fillRect(x - 16, y - 12, 24, 24);
    ctx.fillRect(x + 8, y - 4, 10, 8);
    ctx.fillStyle = '#52525B';
    ctx.fillRect(x - 12, y - 8, 16, 16);
  } else if (zId === 'istana_emas') {
    // Golden Crown Garnish Cloche
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 16, y - 12, 32, 24);
    ctx.fillStyle = '#FEF08A';
    ctx.fillRect(x - 10, y - 6, 20, 12);
    ctx.fillStyle = '#E11D48';
    ctx.fillRect(x - 3, y - 3, 6, 6);
  } else {
    // Dapur Rumah: Wooden Spoon & Prep Plate Stack
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 16, y - 12, 32, 24);
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x - 12, y - 8, 24, 16);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x - 2, y - 10, 4, 20);
  }
}

function drawSideOilCruets(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number
): void {
  const c1 = zId === 'dapur_api' ? '#DC2626' : zId === 'istana_emas' ? '#FACC15' : '#65A30D';
  const c2 = zId === 'bistro_sakura' ? '#1E293B' : '#92400E';
  [
    { dy: -18, fill: c1 },
    { dy: 14, fill: c2 },
  ].forEach((b) => {
    ctx.fillStyle = 'rgba(59, 35, 20, 0.2)';
    ctx.fillRect(x - 10, y + b.dy - 8, 24, 24);
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 12, y + b.dy - 12, 24, 24);
    ctx.fillStyle = b.fill;
    ctx.fillRect(x - 9, y + b.dy - 9, 18, 18);
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(x - 4, y + b.dy - 4, 8, 8);
  });
}

function drawLowerCenterDish(
  ctx: CanvasRenderingContext2D,
  zId: string,
  x: number,
  y: number,
  ambientTime: number
): void {
  ctx.fillStyle = 'rgba(59, 35, 20, 0.22)';
  ctx.fillRect(x - 34, y - 16, 74, 40);

  if (zId === 'kedai_pasar') {
    // Market Vegetable Prep Basket (Daikon, Carrot, Greens)
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 36, y - 20, 72, 40);
    ctx.fillStyle = '#D49A60';
    ctx.fillRect(x - 32, y - 16, 64, 32);
    ctx.fillStyle = '#16A34A';
    ctx.fillRect(x - 26, y - 12, 20, 22);
    ctx.fillStyle = '#FF7A1A';
    ctx.fillRect(x - 4, y - 10, 18, 10);
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(x + 12, y - 6, 16, 18);
  } else if (zId === 'bistro_sakura') {
    // Wooden Sushi Geta Board with Nigiri Trio
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 38, y - 18, 76, 36);
    ctx.fillStyle = '#E5C99E';
    ctx.fillRect(x - 34, y - 14, 68, 28);
    [
      { dx: -20, fish: '#FF6B4A' },
      { dx: 0, fish: '#FACC15' },
      { dx: 20, fish: '#FB7185' },
    ].forEach((n) => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + n.dx - 7, y - 8, 14, 16);
      ctx.fillStyle = n.fish;
      ctx.fillRect(x + n.dx - 6, y - 6, 12, 10);
    });
  } else if (zId === 'dapur_api') {
    // Marinated Steak Plate & Basting Brush
    ctx.fillStyle = '#18181B';
    ctx.fillRect(x - 38, y - 20, 76, 40);
    ctx.fillStyle = '#52525B';
    ctx.fillRect(x - 34, y - 16, 68, 32);
    ctx.fillStyle = '#991B1B';
    ctx.fillRect(x - 26, y - 10, 28, 20);
    ctx.fillStyle = '#FCA5A5';
    ctx.fillRect(x - 20, y - 4, 12, 4);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x + 12, y - 12, 6, 24);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x + 10, y + 6, 10, 6);
  } else if (zId === 'istana_emas') {
    // Golden Banquet Platter with Shimmering Dome Lid
    const shine = Math.sin(ambientTime * 4) > 0 ? '#FFFFFF' : '#FEF9C3';
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 38, y - 20, 76, 40);
    ctx.fillStyle = '#FACC15';
    ctx.fillRect(x - 34, y - 16, 68, 32);
    ctx.fillStyle = '#D4AF37';
    ctx.fillRect(x - 24, y - 12, 48, 24);
    ctx.fillStyle = shine;
    ctx.fillRect(x - 14, y - 8, 12, 4);
    ctx.fillStyle = '#9333EA';
    ctx.fillRect(x - 4, y - 4, 8, 8);
  } else {
    // Dapur Rumah: Fresh Warm Pie / Pastry Cooling Plate
    ctx.fillStyle = '#3B2314';
    ctx.fillRect(x - 34, y - 20, 68, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(x - 30, y - 16, 60, 32);
    ctx.fillStyle = '#D97706';
    ctx.fillRect(x - 20, y - 12, 40, 24);
    ctx.fillStyle = '#F59E0B';
    ctx.fillRect(x - 14, y - 8, 28, 16);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(x - 6, y - 4, 12, 8);
  }
}
