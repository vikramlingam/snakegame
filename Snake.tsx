import React, { useState, useEffect, useCallback, useRef } from 'react';
import { X as CloseIcon, RefreshCw } from 'lucide-react';

interface SnakeProps {
  onClose: () => void;
}

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SPEED = 150;

const Snake: React.FC<SnakeProps> = ({ onClose }) => {
  const [snake, setSnake] = useState<Array<[number, number]>>([[5, 5]]);
  const [food, setFood] = useState<[number, number]>([10, 10]);
  const [direction, setDirection] = useState<[number, number]>([1, 0]);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [speed, setSpeed] = useState(INITIAL_SPEED);
  const gameLoopRef = useRef<number>();

  const generateFood = useCallback(() => {
    let newFood: [number, number];
    do {
      newFood = [
        Math.floor(Math.random() * GRID_SIZE),
        Math.floor(Math.random() * GRID_SIZE)
      ];
    } while (snake.some(([x, y]) => x === newFood[0] && y === newFood[1]));
    setFood(newFood);
  }, [snake]);

  const resetGame = () => {
    setSnake([[5, 5]]);
    setDirection([1, 0]);
    setGameOver(false);
    setScore(0);
    setSpeed(INITIAL_SPEED);
    generateFood();
  };

  const checkCollision = (head: [number, number]): boolean => {
    return (
      head[0] < 0 ||
      head[0] >= GRID_SIZE ||
      head[1] < 0 ||
      head[1] >= GRID_SIZE ||
      snake.some(([x, y]) => x === head[0] && y === head[1])
    );
  };

  const gameLoop = useCallback(() => {
    if (gameOver) return;

    setSnake(prevSnake => {
      const head = prevSnake[0];
      const newHead: [number, number] = [
        head[0] + direction[0],
        head[1] + direction[1]
      ];

      if (checkCollision(newHead)) {
        setGameOver(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      if (newHead[0] === food[0] && newHead[1] === food[1]) {
        setScore(prev => prev + 10);
        setSpeed(prev => Math.max(prev * 0.95, 50));
        generateFood();
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [direction, food, gameOver, generateFood]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      if (touch.clientX < centerX && Math.abs(touch.clientX - centerX) > Math.abs(touch.clientY - centerY)) {
        // Left
        setDirection([-1, 0]);
      } else if (touch.clientX > centerX && Math.abs(touch.clientX - centerX) > Math.abs(touch.clientY - centerY)) {
        // Right
        setDirection([1, 0]);
      } else if (touch.clientY < centerY && Math.abs(touch.clientY - centerY) > Math.abs(touch.clientX - centerX)) {
        // Up
        setDirection([0, -1]);
      } else if (touch.clientY > centerY && Math.abs(touch.clientY - centerY) > Math.abs(touch.clientX - centerX)) {
        // Down
        setDirection([0, 1]);
      }
    };

    window.addEventListener('touchstart', handleTouchStart);
    return () => window.removeEventListener('touchstart', handleTouchStart);
  }, [direction]);

  useEffect(() => {
    gameLoopRef.current = window.setInterval(gameLoop, speed);
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [gameLoop, speed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gray-900 p-4 rounded-xl shadow-2xl border border-purple-500/30 w-full max-w-md mx-4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
        >
          <CloseIcon size={24} />
        </button>

        <h2 className="text-xl font-bold text-white mb-4 text-center">Snake Game</h2>
        <p className="text-purple-400 text-center mb-4">Score: {score}</p>

        <div 
          className="relative bg-gray-800 rounded-lg border border-purple-500/20 overflow-hidden mx-auto"
          style={{ 
            aspectRatio: "1 / 1",
            width: "100%",
            maxWidth: GRID_SIZE * CELL_SIZE + 'px'
          }}
        >
          {/* Food */}
          <div
            className="absolute w-4 h-4 bg-red-500 rounded-full"
            style={{
              left: `${(food[0] / GRID_SIZE) * 100}%`,
              top: `${(food[1] / GRID_SIZE) * 100}%`,
              transform: 'translate(-50%, -50%)',
              boxShadow: '0 0 10px rgba(239, 68, 68, 0.5)'
            }}
          />

          {/* Snake */}
          {snake.map(([x, y], index) => (
            <div
              key={index}
              className="absolute bg-purple-500 rounded-sm"
              style={{
                left: `${(x / GRID_SIZE) * 100}%`,
                top: `${(y / GRID_SIZE) * 100}%`,
                width: `${(1 / GRID_SIZE) * 100}%`,
                height: `${(1 / GRID_SIZE) * 100}%`,
                boxShadow: index === 0 ? '0 0 10px rgba(168, 85, 247, 0.5)' : 'none'
              }}
            />
          ))}
        </div>

        {gameOver && (
          <div className="text-center mt-6">
            <p className="text-red-400 mb-4">Game Over!</p>
            <button
              onClick={resetGame}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors mx-auto"
            >
              <RefreshCw size={20} />
              <span>Play Again</span>
            </button>
          </div>
        )}

        <p className="text-gray-400 text-xs mt-4 text-center">
          Touch screen corners to control the snake
        </p>
      </div>
    </div>
  );
};

export default Snake;