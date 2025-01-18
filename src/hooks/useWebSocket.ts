import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, EmittedMakeMoveRequest, EmittedDiscardRequest, Card, EmittedWaitingForPlayer, EmittedDiscardResponse, EmittedMakeMoveResponse, PlayerIdAndName, AgentDecisionType, EmittedDecisionRequest } from 'cribbage-core/src/types';

const useWebSocket = (playerId: string, playerName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [recentGameEvent, setRecentGameEvent] = useState<GameEvent | null>(null);
  const [waitingOnOtherPlayerInfo, setWaitingOnOtherPlayerInfo] = useState<EmittedWaitingForPlayer | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<PlayerIdAndName[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [requestedDecisionType, setRequestedDecisionType] = useState<AgentDecisionType | null>(null);
  const [requestedDecisionData, setRequestedDecisionData] = useState<EmittedDecisionRequest | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('gameStateChange', (newGameState: GameState) => {
      setGameState(newGameState);
    });

    newSocket.on('gameEvent', (gameEvent: GameEvent) => {
      setRecentGameEvent(gameEvent);
    });

    newSocket.on('gameOver', (winner: string) => {
      console.log(`Game over! Winner: ${winner}`);
      setWinner(winner);
    });

    newSocket.on('requestMakeMove', (data: EmittedMakeMoveRequest) => {
      setRequestedDecisionType(AgentDecisionType.MAKE_MOVE);
      setRequestedDecisionData(data);

      const selectedCard = handleMakeMove(data);
      const makeMoveResponse: EmittedMakeMoveResponse = { playerId: data.playerId, selectedCard };
      newSocket.emit('makeMoveResponse', makeMoveResponse);
    });

    newSocket.on('discardRequest', (data: EmittedDiscardRequest) => {
      const selectedCards = handleDiscard(data);
      const discardResponse: EmittedDiscardResponse = { playerId: data.playerId, selectedCards };
      newSocket.emit('discardResponse', discardResponse);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('waitingForPlayer', (data: EmittedWaitingForPlayer) => {
      console.log('Waiting for player:', data);
      if (data.playerId === playerId) {
        console.log('You are the player being waited for');
        setWaitingOnOtherPlayerInfo(null);
      } else {
        setWaitingOnOtherPlayerInfo(data);
      }
    });

    // listen to connectedPlayers event
    newSocket.on('connectedPlayers', (players: PlayerIdAndName[]) => {
      console.log('Connected players:', players);
      setConnectedPlayers(players);
    });

    return () => {
      newSocket.close();
    };
  }, [playerId, playerName]);

  const handleMakeMove = (data: EmittedMakeMoveRequest): Card => {
    return data.peggingHand[0];
  };

  const handleDiscard = (data: EmittedDiscardRequest): Card[] => {
    return data.hand.slice(0, 2);
  };

  const login = (username: string, name: string) => {
    socket?.emit('login', { username, name });
  };

  const startGame = () => {
    if (!socket) {
      console.error('Socket is not connected. Cannot start game.');
    }
    socket?.emit('startGame');
  };

  return { gameState, recentGameEvent, login, startGame, waitingOnOtherPlayerInfo, connectedPlayers, winner, requestedDecisionType, requestedDecisionData };
};

export default useWebSocket;
