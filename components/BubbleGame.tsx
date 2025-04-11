"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Bubble from "@/components/Bubble";
import SwipeTrail from "@/components/SwipeTrail";
import ActiveSwipeTrail from "@/components/ActiveSwipeTrail";
import GameStats from "@/components/GameStats";
import { Play, Pause, RefreshCw } from "lucide-react";
import { initializeAudio, playPopSound, playSwipeSound, playMultiPopSound } from "@/lib/audio";

// Types
interface BubbleType {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

interface Point {
  x: number;
  y: number;
  timestamp: number;
}

const BubbleGame = () => {
  const [bubbles, setBubbles] = useState<BubbleType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [highScore, setHighScore] = useState(0);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [swipePoints, setSwipePoints] = useState<Point[]>([]);
  const [activeSwipePoints, setActiveSwipePoints] = useState<Point[]>([]);
  const [showTrail, setShowTrail] = useState(false);
  const [trailColor, setTrailColor] = useState("rgba(255, 255, 255, 0.8)");
  const [activeTrailColor, setActiveTrailColor] = useState("rgba(64, 196, 255, 0.8)");
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const animationFrameRef = useRef<number | null>(null);
  const lastBubbleTime = useRef(0);
  const isPointerDown = useRef(false);
  const lastSwipeTime = useRef(0);
  const swipeStartTime = useRef(0);

  // Initialize audio context on first user interaction
  const initAudio = useCallback(() => {
    if (!audioInitialized) {
      initializeAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Generate a random bubble
  const generateBubble = useCallback(() => {
    if (!gameAreaRef.current) return null;
    
    const gameArea = gameAreaRef.current.getBoundingClientRect();
    
    // Validate gameArea dimensions to prevent NaN calculations
    if (!gameArea || !gameArea.width || !gameArea.height) return null;
    
    const size = Math.random() * 60 + 40; // 40-100px
    
    // Generate bubble within visible area with validation
    const x = Math.max(0, Math.random() * (gameArea.width - size));
    const y = gameArea.height + size; // Start below the visible area
    
    // Generate a pastel color with transparency
    const hue = Math.floor(Math.random() * 360);
    const color = `hsla(${hue}, 100%, 80%, 0.6)`;
    
    return {
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      size,
      color,
      speed: Math.random() * 1.5 + 0.5, // Random speed
    };
  }, []);

  // Handle bubble pop
  const handlePop = useCallback((id: string) => {
    // Play sound first to avoid timing issues
    playPopSound();
    
    setBubbles(prev => prev.filter(bubble => bubble.id !== id));
    setScore(prev => prev + 1);
    
    // Show toast for milestone scores
    if ((score + 1) % 10 === 0) {
      toast({
        title: "Milestone!",
        description: `You've popped ${score + 1} bubbles!`,
        variant: "default",
      });
    }
  }, [score, toast]);

  // Check if a point is inside a bubble
  const isPointInBubble = useCallback((point: Point, bubble: BubbleType) => {
    const dx = point.x - (bubble.x + bubble.size / 2);
    const dy = point.y - (bubble.y + bubble.size / 2);
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance <= bubble.size / 2;
  }, []);

  // Check if a line segment intersects with a bubble
  const doesLineIntersectBubble = useCallback((p1: Point, p2: Point, bubble: BubbleType) => {
    // Bubble center and radius
    const cx = bubble.x + bubble.size / 2;
    const cy = bubble.y + bubble.size / 2;
    const r = bubble.size / 2;
    
    // Line segment
    const x1 = p1.x;
    const y1 = p1.y;
    const x2 = p2.x;
    const y2 = p2.y;
    
    // Vector from line start to bubble center
    const dx = cx - x1;
    const dy = cy - y1;
    
    // Vector representing the line
    const lineVecX = x2 - x1;
    const lineVecY = y2 - y1;
    
    // Length of line squared
    const lineLengthSq = lineVecX * lineVecX + lineVecY * lineVecY;
    
    // If line length is zero, check if point is in bubble
    if (lineLengthSq === 0) return Math.sqrt(dx * dx + dy * dy) <= r;
    
    // Project bubble center onto line
    const t = Math.max(0, Math.min(1, (dx * lineVecX + dy * lineVecY) / lineLengthSq));
    
    // Closest point on line to bubble center
    const projX = x1 + t * lineVecX;
    const projY = y1 + t * lineVecY;
    
    // Distance from closest point to bubble center
    const distX = projX - cx;
    const distY = projY - cy;
    const distSq = distX * distX + distY * distY;
    
    return distSq <= r * r;
  }, []);

  // Handle swipe detection
  const handleSwipe = useCallback((points: Point[]) => {
    if (points.length < 2 || !isPlaying) return;
    
    // Find bubbles that intersect with the swipe path
    const poppedBubbles: string[] = [];
    
    // Check each line segment in the swipe path
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      
      // Check each bubble
      bubbles.forEach(bubble => {
        if (
          !poppedBubbles.includes(bubble.id) && 
          doesLineIntersectBubble(p1, p2, bubble)
        ) {
          poppedBubbles.push(bubble.id);
        }
      });
    }
    
    // Pop the bubbles that were hit
    if (poppedBubbles.length > 0) {
      // Play appropriate sound first to avoid timing issues
      if (poppedBubbles.length === 1) {
        playPopSound();
      } else {
        playMultiPopSound(poppedBubbles.length);
      }
      
      setBubbles(prev => prev.filter(bubble => !poppedBubbles.includes(bubble.id)));
      setScore(prev => prev + poppedBubbles.length);
      
      // Show special toast for multi-pops
      if (poppedBubbles.length >= 3) {
        toast({
          title: "Combo!",
          description: `You popped ${poppedBubbles.length} bubbles at once!`,
          variant: "default",
        });
      }
      
      // Check for milestone
      const newScore = score + poppedBubbles.length;
      if (Math.floor(newScore / 10) > Math.floor(score / 10)) {
        toast({
          title: "Milestone!",
          description: `You've popped ${Math.floor(newScore / 10) * 10} bubbles!`,
          variant: "default",
        });
      }
    }
    
    // Generate a trail color based on number of bubbles popped
    if (poppedBubbles.length > 0) {
      // More bubbles = more vibrant color
      const hue = Math.floor(Math.random() * 360);
      const saturation = Math.min(100, 70 + poppedBubbles.length * 5);
      const lightness = Math.max(50, 80 - poppedBubbles.length * 5);
      const newColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.8)`;
      setTrailColor(newColor);
    } else {
      setTrailColor("rgba(255, 255, 255, 0.8)");
    }
    
    // Show the swipe trail
    setSwipePoints(points);
    setShowTrail(true);
    
    // Play swipe sound
    playSwipeSound();
    
    // Hide the trail after a short delay
    setTimeout(() => {
      setShowTrail(false);
    }, 500); // Increased from 300ms to 500ms for better visibility
  }, [bubbles, isPlaying, score, doesLineIntersectBubble, toast]);

  // Start game
  const startGame = useCallback(() => {
    initAudio();
    setIsPlaying(true);
    setTimeLeft(60);
    setScore(0);
    setBubbles([]);
    lastBubbleTime.current = Date.now();
  }, [initAudio]);

  // Pause game
  const pauseGame = useCallback(() => {
    setIsPlaying(false);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    pauseGame();
    setScore(0);
    setTimeLeft(60);
    setBubbles([]);
  }, [pauseGame]);

  // Generate a random vibrant color for the active trail
  const generateRandomTrailColor = useCallback(() => {
    const hue = Math.floor(Math.random() * 360);
    return `hsla(${hue}, 100%, 60%, 0.8)`;
  }, []);

  // Handle pointer down event
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!isPlaying) return;
    
    initAudio();
    isPointerDown.current = true;
    swipeStartTime.current = Date.now();
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: Date.now()
    };
    
    // Set a new random color for this swipe
    setActiveTrailColor(generateRandomTrailColor());
    
    // Initialize both active and final swipe points
    setActiveSwipePoints([point]);
    setSwipePoints([]);
    lastSwipeTime.current = Date.now();
  }, [isPlaying, initAudio, generateRandomTrailColor]);

  // Handle pointer move event
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isPlaying || !isPointerDown.current) return;
    
    const rect = gameAreaRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const now = Date.now();
    const point = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      timestamp: now
    };
    
    // Add point to active swipe path if it's been at least 10ms since the last point
    // This prevents too many points being added for performance reasons
    if (now - lastSwipeTime.current >= 10) {
      setActiveSwipePoints(currentPoints => {
        const updatedPoints = [...currentPoints, point];
        lastSwipeTime.current = now;
        
        // Check for bubbles in real-time during the swipe
        if (currentPoints.length > 0) {
          const lastPoint = currentPoints[currentPoints.length - 1];
          
          // Find bubbles that intersect with this segment
          const poppedBubbles: string[] = [];
          
          bubbles.forEach(bubble => {
            if (
              !poppedBubbles.includes(bubble.id) && 
              doesLineIntersectBubble(lastPoint, point, bubble)
            ) {
              poppedBubbles.push(bubble.id);
            }
          });
          
          // Pop bubbles in real-time
          if (poppedBubbles.length > 0) {
            // Play sound first to avoid timing issues
            if (poppedBubbles.length === 1) {
              playPopSound();
            } else {
              playMultiPopSound(poppedBubbles.length);
            }
            
            setBubbles(prevBubbles => 
              prevBubbles.filter(bubble => !poppedBubbles.includes(bubble.id))
            );
            setScore(prevScore => prevScore + poppedBubbles.length);
          }
        }
        
        return updatedPoints;
      });
    }
  }, [isPlaying, bubbles, doesLineIntersectBubble]);

  // Handle pointer up event
  const handlePointerUp = useCallback(() => {
    if (!isPlaying || !isPointerDown.current) return;
    
    isPointerDown.current = false;
    
    // Process the swipe if we have enough points
    if (activeSwipePoints.length >= 2) {
      // Copy active points to final swipe points for the fade-out effect
      setSwipePoints([...activeSwipePoints]);
      setShowTrail(true);
      
      // Play swipe sound
      playSwipeSound();
      
      // Hide the trail after a delay
      setTimeout(() => {
        setShowTrail(false);
      }, 500);
    }
    
    // Reset active swipe points
    setActiveSwipePoints([]);
  }, [isPlaying, activeSwipePoints]);

  // Handle pointer cancel event
  const handlePointerCancel = useCallback(() => {
    isPointerDown.current = false;
    setActiveSwipePoints([]);
  }, []);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    // Update timer
    const timerInterval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerInterval);
          pauseGame();
          
          // Check for high score
          if (score > highScore) {
            setHighScore(score);
            toast({
              title: "New High Score!",
              description: `Congratulations! You set a new record: ${score} bubbles!`,
              variant: "default",
            });
          } else {
            toast({
              title: "Game Over!",
              description: `You popped ${score} bubbles!`,
              variant: "default",
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Animation loop for bubble movement and generation
    const animate = () => {
      // Add new bubbles periodically
      const now = Date.now();
      if (now - lastBubbleTime.current > 800) { // Add bubble every 800ms
        const newBubble = generateBubble();
        if (newBubble) {
          setBubbles(prev => [...prev, newBubble]);
        }
        lastBubbleTime.current = now;
      }

      // Move bubbles upward
      setBubbles(prev => 
        prev.map(bubble => {
          // Remove bubbles that have gone off screen
          if (bubble.y < -bubble.size) {
            return null;
          }
          
          // Generate a stable numeric value from the bubble id for the sine wave
          // Instead of parseFloat which can produce NaN if the id isn't numeric
          const idHash = bubble.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
          
          // Calculate new position with validation to prevent NaN
          const newX = typeof bubble.x === 'number' && !isNaN(bubble.x) 
            ? bubble.x + Math.sin(now / 1000 + idHash) * 0.5
            : bubble.x; // Fallback to current position if x is NaN
          
          return {
            ...bubble,
            y: bubble.y - bubble.speed,
            x: newX,
          };
        }).filter(Boolean) as BubbleType[]
      );

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      clearInterval(timerInterval);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, pauseGame, generateBubble, score, highScore, toast]);

  return (
    <div className="w-full max-w-4xl h-[80vh] flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-4 px-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Bubble Pop
        </h1>
        <GameStats score={score} timeLeft={timeLeft} highScore={highScore} />
      </div>

      <div 
        className="relative w-full flex-1 bg-gradient-to-b from-blue-100/30 to-purple-100/30 rounded-xl overflow-hidden shadow-lg border border-white/50" 
        ref={gameAreaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        style={{ touchAction: "none" }} // Prevent scrolling on touch devices
      >
        <AnimatePresence>
          {bubbles.map(bubble => (
            <Bubble
              key={bubble.id}
              bubble={bubble}
              onPop={() => handlePop(bubble.id)}
            />
          ))}
          
          {/* Show active trail during swipe */}
          {activeSwipePoints.length >= 2 && (
            <ActiveSwipeTrail 
              points={activeSwipePoints} 
              color={activeTrailColor} 
            />
          )}
          
          {/* Show fade-out trail after swipe */}
          {showTrail && swipePoints.length >= 2 && (
            <SwipeTrail 
              points={swipePoints} 
              color={trailColor} 
              duration={500} 
            />
          )}
        </AnimatePresence>

        {!isPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white/90 p-6 rounded-xl shadow-xl flex flex-col items-center"
            >
              <h2 className="text-2xl font-bold mb-4 text-gray-800">
                {timeLeft === 0 ? "Game Over!" : "Bubble Pop"}
              </h2>
              <p className="text-gray-600 mb-6 text-center">
                {timeLeft === 0 
                  ? `You popped ${score} bubbles!` 
                  : "Pop bubbles by tapping or swiping through them!"}
              </p>
              <div className="flex gap-3">
                <Button 
                  onClick={startGame}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {timeLeft === 0 ? "Play Again" : "Start Game"}
                </Button>
                {timeLeft > 0 && timeLeft < 60 && (
                  <Button variant="outline" onClick={resetGame}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isPlaying && (
          <div className="absolute top-4 right-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={pauseGame}
              className="bg-white/50 hover:bg-white/70"
            >
              <Pause className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BubbleGame;