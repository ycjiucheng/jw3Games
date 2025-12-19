import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { CharacterCreation } from "./pages/CharacterCreation";
import { GameView } from "./pages/GameView";
import { useGameStore } from "./store/gameStore";

// 路由守卫
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const player = useGameStore((state) => state.player);
  if (!player) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CharacterCreation />} />
        <Route 
          path="/game" 
          element={
            <ProtectedRoute>
              <GameView />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
