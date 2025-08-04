import React from 'react';
import GameCanvas from './components/GameCanvas';
import HUD from './components/HUD';
import MainMenu from './components/MainMenu';
import LevelUp from './components/LevelUp';
import GameOver from './components/GameOver';
import Victory from './components/Victory';
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
        <GameOver />
        <Victory />
      </div>
    </GameStateProvider>
  );
}

export default App;