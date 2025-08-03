import React from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import LevelUp from './components/LevelUp';
import { GameStateProvider } from './contexts/GameStateContext';
import './App.css';

function App() {
  return (
    <GameStateProvider>
      <div className="App">
        <MainMenu />
        <HUD />
        <GameCanvas />
        <LevelUp />
      </div>
    </GameStateProvider>
  );
}

export default App;