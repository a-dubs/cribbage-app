import React, { useEffect, useState } from 'react';
import './App.css';
import useWebSocket from './hooks/useWebSocket';
import { PlayerIdAndName } from 'cribbage-core';
import HomeScreen from './HomeScreen';
import GameScreen from './GameScreen';

// export interface UserSetting<T> {
//   name: string
//   description: string
//   value: T
// }

// const defaultUserSettings: UserSetting[] = {
  
// }  

function App() {
  // const [name, setName] = useState('Developer');
  // const [username, setUsername] = useState('dev-1');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [yourPlayerInfo, setYourPlayerInfo] = useState<PlayerIdAndName | null>(null);
  const [opponentPlayerInfo, setOpponentPlayerInfo] = useState<PlayerIdAndName | null>(null);
  const [oneClickPlayCard, setOneClickPlayCard] = useState<boolean>(true);
  const settings: Record<string, boolean> = {
    "One Click Play Card": true
  }
  const {
    gameState,
    recentGameEvent,
    login,
    startGame,
    waitingOnPlayerInfo,
    connectedPlayers,
    winner,
    requestedDecisionType,
    requestedDecisionData,
    makeMove,
    discard,
    numberOfCardsToSelect,
    continueGame,
    currentRoundGameEvents,
  } = useWebSocket(username, name);

  useEffect(() => {
    if (connectedPlayers) {
      const yourPlayerInfo = connectedPlayers.find(player => player.id === username);
      const opponentPlayerInfo = connectedPlayers.find(player => player.id !== username);
      if (!yourPlayerInfo || !opponentPlayerInfo) {
        console.log('Your player info or opponent player info not found');
        return;
      }
      setYourPlayerInfo(yourPlayerInfo);
      setOpponentPlayerInfo(opponentPlayerInfo);
    }
  }, [connectedPlayers, username]);

  useEffect(() => {
    if (formSubmitted) {
      login(name, username);
      setFormSubmitted(false);
    }
  }, [formSubmitted, login, name, username]);

  const handleFormSubmit = (formName: string, formUsername: string) => {
    console.log('Form submitted:', formName, formUsername);
    setName(formName);
    setUsername(formUsername);
    setFormSubmitted(true);
  };

  return (
    <div
      className="App"
      style={{backgroundColor: '#35654d'}}
    >
      {gameState ? (
        <GameScreen
          username={username}
          gameState={gameState}
          winner={winner}
          recentGameEvent={recentGameEvent}
          handleMakeMove={makeMove}
          handleDiscard={discard}
          requestedDecisionType={requestedDecisionType}
          requestedDecisionData={requestedDecisionData}
          waitingOnPlayerInfo={waitingOnPlayerInfo}
          connectedPlayers={connectedPlayers}
          numberOfCardsToSelect={numberOfCardsToSelect || 0}
          continueGame={continueGame}
          settings={settings}
          currentRoundGameEvents={currentRoundGameEvents}
        />
      ) : (
        <HomeScreen
          name={name}
          username={username}
          onFormSubmit={handleFormSubmit}
          handleStartGame={startGame}
          connectedPlayers={connectedPlayers}
        />
      )}
    </div>
  );
}

export default App;
