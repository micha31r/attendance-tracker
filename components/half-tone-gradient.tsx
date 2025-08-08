'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import * as THREE from 'three';

interface HalfToneGradientProps {
  className?: string;
  trailSize?: number;
  gridSpacing?: number;
  dotSize?: number;
  noiseScale?: number;
  noiseSpeed?: number;
  maxOpacity?: number;
  minOpacity?: number;
  maxOpacityFromNoise?: number;
  trailSpeedDecay?: number;
  mouseSpeedSmoothing?: number;
  mouseSpeedCap?: number;
  trailFollowSpeed?: number;
  speedThreshold?: number;
  trailBaseIntensity?: number;
  trailSpeedMultiplier?: number;
  fadeResponsiveness?: number;
  baseDotOpacity?: number;
  circleSegments?: number;
  sigmoidContrastFactor?: number;
}

// Simple Perlin noise implementation
class PerlinNoise {
  private p: number[];
  
  constructor() {
    this.p = new Array(512);
    const permutation = [
      151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142,
      8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117,
      35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71,
      134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41,
      55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89,
      18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226,
      250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182,
      189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43,
      172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97,
      228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239,
      107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
      138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180
    ];
    
    for (let i = 0; i < 256; i++) {
      this.p[256 + i] = this.p[i] = permutation[i];
    }
  }
  
  private fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }
  
  private lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }
  
  private grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }
  
  noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y;
    const AA = this.p[A];
    const AB = this.p[A + 1];
    const B = this.p[X + 1] + Y;
    const BA = this.p[B];
    const BB = this.p[B + 1];
    
    return this.lerp(v,
      this.lerp(u, this.grad(this.p[AA], x, y), this.grad(this.p[BA], x - 1, y)),
      this.lerp(u, this.grad(this.p[AB], x, y - 1), this.grad(this.p[BB], x - 1, y - 1))
    );
  }
}

export default function HalfToneGradient({
  className = '',
  trailSize = 150, // Size of mouse trail effect  
  gridSpacing = 20, // Increased spacing between dots
  dotSize = 1, // Base size of dots (always 1px)
  noiseScale = 0.1, // Lower scale for smoother, larger gradient areas
  noiseSpeed = 0.01, // Very slow animation for smooth flow
  maxOpacity = 1, // Maximum opacity cap
  minOpacity = 0, // Minimum opacity (invisible dots in light areas)
  maxOpacityFromNoise = 0.5, // Maximum opacity from noise (in dark areas)
  trailSpeedDecay = 0.98, // How fast trail fades when mouse stops
  mouseSpeedSmoothing = 0.8, // Mouse speed smoothing factor
  mouseSpeedCap = 0.5, // Mouse speed cap as fraction of trail size
  trailFollowSpeed = 0.04, // How fast delayed trail follows mouse
  speedThreshold = 0.01, // Minimum speed threshold for trail effect
  trailBaseIntensity = 0.4, // Base trail intensity
  trailSpeedMultiplier = 0.2, // Trail intensity speed multiplier
  fadeResponsiveness = 1, // Trail fade responsiveness
  baseDotOpacity = 0.8, // Base dot material opacity
  circleSegments = 8, // Number of segments in circle geometry
  sigmoidContrastFactor = 10 // Sigmoid contrast factor for noise mapping
}: HalfToneGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const dotsRef = useRef<THREE.Mesh[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0, speed: 0, initialized: false });
  const trailRef = useRef({ x: 0, y: 0 }); // Trail position that lags behind mouse
  const timeRef = useRef(0);
  const animationIdRef = useRef<number | undefined>(undefined);
  const perlinNoise = useRef(new PerlinNoise());
  
  // Get CSS color values
  const getForegroundColor = useCallback(() => {
    if (typeof window === 'undefined') return new THREE.Color(0.2, 0.2, 0.2);
    
    // Check if we're in dark mode
    const isDark = document.documentElement.classList.contains('dark');
    return isDark ? new THREE.Color(0.9, 0.9, 0.9) : new THREE.Color(0, 0, 0);
  }, []);
  
  const initializeThreeJS = useCallback(() => {
    if (!containerRef.current) {
      console.log('Container ref not available');
      return;
    }
    
    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    console.log('Initializing Three.js with dimensions:', width, 'x', height);
    
    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    
    // Camera
    const camera = new THREE.OrthographicCamera(
      -width / 2, width / 2,
      height / 2, -height / 2,
      0.1, 1000
    );
    camera.position.z = 1;
    cameraRef.current = camera;
    
    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    
    container.appendChild(renderer.domElement);
    console.log('Renderer canvas added to container');
    
    // Calculate grid dimensions
    const cols = Math.ceil(width / gridSpacing);
    const rows = Math.ceil(height / gridSpacing);
    
    console.log('Grid dimensions:', cols, 'x', rows, '=', cols * rows, 'dots');
    
    // Create dots
    const geometry = new THREE.CircleGeometry(dotSize, circleSegments);
    const color = getForegroundColor();
    const material = new THREE.MeshBasicMaterial({ 
      color: color,
      transparent: true,
      opacity: baseDotOpacity
    });
    
    const dots: THREE.Mesh[] = [];
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const dot = new THREE.Mesh(geometry, material.clone());
        
        const x = (col * gridSpacing) - width / 2 + gridSpacing / 2;
        const y = height / 2 - (row * gridSpacing) - gridSpacing / 2;
        
        dot.position.set(x, y, 0);
        dot.userData = { baseScale: 1, row, col };
        
        scene.add(dot);
        dots.push(dot);
      }
    }
    
    dotsRef.current = dots;
    console.log('Created', dots.length, 'dots');
    
    // Update material when theme changes
    const updateColor = () => {
      const newColor = getForegroundColor();
      dots.forEach(dot => {
        (dot.material as THREE.MeshBasicMaterial).color = newColor;
      });
      console.log('Color updated:', newColor);
    };
    
    // Listen for theme changes
    const observer = new MutationObserver(updateColor);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => {
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridSpacing, dotSize, getForegroundColor]);
  
  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if mouse is within the container bounds
    const isWithinBounds = x >= 0 && x <= rect.width && y >= 0 && y <= rect.height;
    
    // Only update if mouse is within the gradient area
    if (!isWithinBounds) return;
    
    // On first mouse movement, just set position without calculating speed
    if (!mouseRef.current.initialized) {
      mouseRef.current = {
        x,
        y,
        prevX: x,
        prevY: y,
        speed: 0,
        initialized: true
      };
      // Initialize trail position to mouse position
      trailRef.current = { x, y };
      return;
    }
    
    // Calculate mouse speed only after initialization
    const deltaX = x - mouseRef.current.prevX;
    const deltaY = y - mouseRef.current.prevY;
    const speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    // Start with small speed, build up gradually, and cap at trailSize
    const smoothedSpeed = mouseRef.current.speed * mouseSpeedSmoothing + speed * (1 - mouseSpeedSmoothing); // Smooth the speed changes
    const clampedSpeed = Math.min(smoothedSpeed, trailSize * mouseSpeedCap); // Cap at configured fraction of trailSize
    
    mouseRef.current = {
      x,
      y,
      prevX: mouseRef.current.x,
      prevY: mouseRef.current.y,
      speed: clampedSpeed,
      initialized: true
    };
// eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trailSize]);
  
  // Sigmoid contrast function for enhanced noise mapping
  const sigmoidContrast = useCallback((scaled: number, k: number = 10) => {
    return 1 / (1 + Math.exp(-k * (scaled - 0.5)));
  }, []);

  const animate = useCallback(() => {
    if (!dotsRef.current.length || !containerRef.current) return;
    
    timeRef.current += noiseSpeed;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    // Update trail position to smoothly follow mouse with delay
    if (mouseRef.current.initialized) {
      trailRef.current.x += (mouseRef.current.x - trailRef.current.x) * trailFollowSpeed;
      trailRef.current.y += (mouseRef.current.y - trailRef.current.y) * trailFollowSpeed;
    }
    
    dotsRef.current.forEach((dot, index) => {
      const { row, col } = dot.userData;
      
      // Slow Perlin noise for base wave animation - create flowing gradients
      const noiseX = col * noiseScale + timeRef.current;
      const noiseY = row * noiseScale + timeRef.current;
      const noiseValue = perlinNoise.current.noise(noiseX, noiseY);
      
      // Map noise to opacity range for gradient effect
      // noiseValue ranges from -1 to 1, we want a wide range of opacities
      const sigmoidValue = sigmoidContrast((noiseValue + 1) * 0.5, sigmoidContrastFactor);
      const baseOpacity = minOpacity + sigmoidValue * (maxOpacityFromNoise - minOpacity);

      // Mouse trail effect - only apply if mouse has been initialized
      let trailAddition = 0;
      if (mouseRef.current.initialized && mouseRef.current.speed > speedThreshold) {
        // Use the immediate mouse position instead of delayed trail position
        const trailX = mouseRef.current.x - width / 2;
        const trailY = height / 2 - mouseRef.current.y;
        const distanceToTrail = Math.sqrt(
          (dot.position.x - trailX) ** 2 + (dot.position.y - trailY) ** 2
        );
        
        // Trail effect - use constant trail size
        const maxTrailRadius = trailSize; // Use constant trail size
        const trailInfluence = Math.max(0, 1 - distanceToTrail / maxTrailRadius);
        
        // Smooth fade multiplier based on speed - creates gradual shrinking effect
        const fadeMultiplier = Math.min(1, mouseRef.current.speed / fadeResponsiveness);
        
        trailAddition = trailInfluence * (trailBaseIntensity + mouseRef.current.speed * trailSpeedMultiplier) * fadeMultiplier;
      }
      
      // Final opacity = base wave opacity + trail addition, capped at max
      const finalOpacity = Math.min(baseOpacity + trailAddition, maxOpacity);
      
      // Update dot opacity instead of scale
      (dot.material as THREE.MeshBasicMaterial).opacity = finalOpacity;
      
      // Keep dot at constant size
      dot.scale.setScalar(1);
      
      // Debug: log values for first few dots occasionally
      if (index < 2 && Math.random() < 0.001) {
        console.log(`Dot ${index}: noise=${noiseValue.toFixed(3)}, baseOpacity=${baseOpacity.toFixed(2)}, trailAdd=${trailAddition.toFixed(2)}, final=${finalOpacity.toFixed(2)}`);
      }
    });
    
    // Decay mouse speed more slowly when not moving for longer trail fade
    mouseRef.current.speed *= trailSpeedDecay;
    
    if (rendererRef.current && sceneRef.current && cameraRef.current) {
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    }
    
    animationIdRef.current = requestAnimationFrame(animate);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noiseScale, noiseSpeed, trailSize]);
  
  const handleResize = useCallback(() => {
    if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
    
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;
    
    rendererRef.current.setSize(width, height);
    
    cameraRef.current.left = -width / 2;
    cameraRef.current.right = width / 2;
    cameraRef.current.top = height / 2;
    cameraRef.current.bottom = -height / 2;
    cameraRef.current.updateProjectionMatrix();
  }, []);
  
  useEffect(() => {
    const container = containerRef.current;
    const cleanup = initializeThreeJS();
    animate();
    
    // Listen to document mousemove to detect movement even over other elements
    document.addEventListener('mousemove', handleMouseMove);
    
    if (container) {
      window.addEventListener('resize', handleResize);
    }
    
    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      
      // Remove from document instead of container
      document.removeEventListener('mousemove', handleMouseMove);
      
      if (container) {
        window.removeEventListener('resize', handleResize);
      }
      
      if (rendererRef.current && container) {
        container.removeChild(rendererRef.current.domElement);
        rendererRef.current.dispose();
      }
      
      // Clean up dots
      dotsRef.current.forEach(dot => {
        if (dot.geometry) dot.geometry.dispose();
        if (dot.material) {
          if (Array.isArray(dot.material)) {
            dot.material.forEach(mat => mat.dispose());
          } else {
            dot.material.dispose();
          }
        }
      });
      dotsRef.current = [];
      
      cleanup?.();
    };
  }, [initializeThreeJS, animate, handleMouseMove, handleResize]);
  
  return (
    <div
      ref={containerRef}
      className={`w-full h-full ${className}`}
      style={{ minHeight: '100px' }}
    />
  );
}
