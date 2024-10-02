import { useEffect, useRef, useState, useCallback } from "react";
import "./App.css";
import Food from "./components/Food";
import Snake from "./components/Snake";

const randomFoodPosition = () => {
  const pos = { x: 0, y: 0 };
  let x = Math.floor(Math.random() * 96);
  let y = Math.floor(Math.random() * 96);
  pos.x = x - (x % 4);
  pos.y = y - (y % 4);
  return pos;
};

const initialSnake = {
  snake: [
    { x: 0, y: 0 },
    { x: 4, y: 0 },
    { x: 8, y: 0 },
  ],
  direction: "ArrowRight",
  speed: 100,
};

function App() {
  const [snake, setSnake] = useState(initialSnake.snake);
  const [lastDirection, setLastDirection] = useState(initialSnake.direction);
  const [foodPosition, setFoodPosition] = useState(randomFoodPosition);
  const [isStarted, setIsStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(
    () => Number(localStorage.getItem("highScore")) || 0
  );
  const playgroundRef = useRef();

  const move = useCallback(() => {
    setSnake((prevSnake) => {
      const tmpSnake = [...prevSnake];
      let x = tmpSnake[tmpSnake.length - 1].x;
      let y = tmpSnake[tmpSnake.length - 1].y;

      switch (lastDirection) {
        case "ArrowUp":
          y -= 4;
          break;
        case "ArrowRight":
          x += 4;
          break;
        case "ArrowDown":
          y += 4;
          break;
        case "ArrowLeft":
          x -= 4;
          break;
        default:
          break;
      }

      // Check wall collisions
      if (x >= 100 || x < 0 || y >= 100 || y < 0) {
        setGameOver(true);
        if (snake.length - 3 > highScore) {
          setHighScore(snake.length - 3);
          localStorage.setItem("highScore", snake.length - 3);
        }
        return prevSnake; // Do not update snake state on game over
      }

      const newSnake = [...tmpSnake, { x, y }];
      if (x === foodPosition.x && y === foodPosition.y) {
        setFoodPosition(randomFoodPosition());
      } else {
        newSnake.shift();
      }

      // Check if the snake runs into itself
      if (
        newSnake.slice(0, -1).some(
          (segment) => segment.x === x && segment.y === y
        )
      ) {
        setGameOver(true);
        if (snake.length - 3 > highScore) {
          setHighScore(snake.length - 3);
          localStorage.setItem("highScore", snake.length - 3);
        }
        return prevSnake; // Do not update snake state on game over
      }

      return newSnake;
    });
  }, [lastDirection, foodPosition, snake, highScore]);

  useEffect(() => {
    if (!isStarted || gameOver) return;

    const interval = setInterval(move, initialSnake.speed);
    return () => clearInterval(interval);
  }, [isStarted, move, gameOver]);

  const handleKeyDown = (e) => {
    if (
      (e.key === "ArrowUp" && lastDirection !== "ArrowDown") ||
      (e.key === "ArrowRight" && lastDirection !== "ArrowLeft") ||
      (e.key === "ArrowDown" && lastDirection !== "ArrowUp") ||
      (e.key === "ArrowLeft" && lastDirection !== "ArrowRight")
    ) {
      setLastDirection(e.key);
    }
  };

  const handleArrowButtonClick = (direction) => {
    if (
      (direction === "ArrowUp" && lastDirection !== "ArrowDown") ||
      (direction === "ArrowRight" && lastDirection !== "ArrowLeft") ||
      (direction === "ArrowDown" && lastDirection !== "ArrowUp") ||
      (direction === "ArrowLeft" && lastDirection !== "ArrowRight")
    ) {
      setLastDirection(direction);
    }
  };

  const handleRestart = () => {
    setIsStarted(true);
    setGameOver(false);
    setSnake(initialSnake.snake);
    setLastDirection(initialSnake.direction);
    setFoodPosition(randomFoodPosition());
    playgroundRef.current.focus();
  };

  return (
    <>
      <div
        className="App"
        onKeyDown={handleKeyDown}
        ref={playgroundRef}
        tabIndex={0}
      >
        <div className="score-board">
          {isStarted && !gameOver && (
            <>
              <div className="count">Score: {snake.length - 3}</div>
              <div className="high-score">High Score: {highScore}</div>
            </>
          )}
        </div>

        {!isStarted && !gameOver && (
          <>
            <button
              onClick={() => {
                setIsStarted(true);
                playgroundRef.current.focus();
              }}
              type="button"
            >
              Start
            </button>
            <div className="start-msg text">Press Start button to play!</div>
          </>
        )}

        {gameOver && (
          <>
            <div className="game-over text">Game Over!</div>
            <div className="game-over-score text">Score: {snake.length - 3}</div>
            <div className="game-over-high-score text">High Score: {highScore}</div>
            <button onClick={handleRestart} type="button">
              Restart
            </button>
          </>
        )}

        <Snake snake={snake} />
        {!gameOver && <Food position={foodPosition} />}
      </div>
      <div className="controls">
        <button className="control-btn" onClick={() => handleArrowButtonClick("ArrowUp")}>↑</button>
        <div className="control-row">
          <button className="control-btn" onClick={() => handleArrowButtonClick("ArrowLeft")}>←</button>
          <button className="control-btn" onClick={() => handleArrowButtonClick("ArrowRight")}>→</button>
        </div>
        <button className="control-btn" onClick={() => handleArrowButtonClick("ArrowDown")}>↓</button>
      </div>
    </>
  );
}

export default App;
