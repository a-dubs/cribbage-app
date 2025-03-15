import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, EmittedMakeMoveRequest, EmittedDiscardRequest, Card, EmittedWaitingForPlayer, EmittedDiscardResponse, EmittedMakeMoveResponse, PlayerIdAndName, AgentDecisionType, EmittedDecisionRequest } from 'cribbage-core/';

localStorage.debug = 'socket.io-client:socket';

const useWebSocket = (playerId: string, playerName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [recentGameEvent, setRecentGameEvent] = useState<GameEvent | null>(null);
  const [waitingOnPlayerInfo, setWaitingOnPlayerInfo] = useState<EmittedWaitingForPlayer | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<PlayerIdAndName[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [requestedDecisionType, setRequestedDecisionType] = useState<AgentDecisionType | null>(null);
  const [requestedDecisionData, setRequestedDecisionData] = useState<EmittedDecisionRequest | null>(null);

  useEffect(() => {

    if (socket) {
      console.log('Socket already connected. Skipping connection setup.');
      return;
    }

    console.log('Connecting to server...');
    const newSocket = io('http://localhost:3002', {
      // transports: ['websocket'],
      withCredentials: true,
      auth: {
        token: 'dummy-auth-token', // Add dummy auth token
      },
    });

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    newSocket.on('connect_timeout', () => {
      console.error('Connection timeout');
    });
    setSocket(newSocket);

    newSocket.on('gameStateChange', (newGameState: GameState) => {
      console.log("Received new game state:", newGameState);
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
      // check if the player id matches the current player id, if not log and ignore
      if (data.playerId !== playerId) {
        console.error('Received make move request for a different player. Ignoring.');
        return;
      }
      setRequestedDecisionType(AgentDecisionType.PLAY_CARD);
      setRequestedDecisionData(data);
    });

    newSocket.on('discardRequest', (data: EmittedDiscardRequest) => {
      // check if the player id matches the current player id, if not log and ignore
      if (data.playerId !== playerId) {
        console.error('Received discard request for a different player. Ignoring.');
        return;
      }
      setRequestedDecisionType(AgentDecisionType.DISCARD);
      setRequestedDecisionData(data);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      // delete the socket
      setSocket(null);
    });

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('waitingForPlayer', (data: EmittedWaitingForPlayer) => {
      console.log('Waiting for player:', data);
      if (data.playerId === playerId) {
        console.log('You are the player being waited for');
      }
      setWaitingOnPlayerInfo(data);
    });

    // listen to connectedPlayers event
    newSocket.on('connectedPlayers', (players: PlayerIdAndName[]) => {
      console.log('Connected players:', players);
      setConnectedPlayers(players);
    });

    return () => {
      console.log('Closing socket connection');
      // newSocket.close();
    };
  }, [playerId, playerName, socket]);

  // send heartbeat to server every 5 seconds
  useEffect(() => {
    const heartbeatInterval = setInterval(() => {
      console.log('Sending heartbeat');
      socket?.emit('heartbeat');
    }, 5000);

    return () => {
      clearInterval(heartbeatInterval);
    };
  }, [socket]);

  const makeMove = (card: Card): void => {
    console.log('Playing card:', card);
    const makeMoveResponse: EmittedMakeMoveResponse = { playerId, selectedCard: card };
    if (!socket) {
      console.error('Socket is not connected. Cannot make move.');
      return;
    }
    socket.emit('makeMoveResponse', makeMoveResponse);
  };

  const discard = (cards: Card[]): void => {
    console.log('Discarding cards:', cards);
    const discardResponse: EmittedDiscardResponse = { playerId, selectedCards: cards };
    if (!socket) {
      console.error('Socket is not connected. Cannot discard.');
      return;
    }
    socket.emit('discardResponse', discardResponse);
  };

  const login = (username: string, name: string) => {
    if (!socket) {
      console.error('Socket is not connected. Cannot login.');
      return;
    }
    console.log('Emitting login event');
    socket.emit('login', { username, name });
  };

  const startGame = () => {
    if (!socket) {
      console.error('Socket is not connected. Cannot start game.');
      return;
    }
    socket.emit('startGame');
  };

  // whenever socket changes, log debug info
  useEffect(() => {
    console.debug('Socket changed:', socket);

    // debug
    console.debug(`Socket connected: ${socket?.connected}`);
    console.debug(`Socket id: ${socket?.id}`);
  }, [socket]);

  return { gameState, recentGameEvent, login, startGame, waitingOnPlayerInfo, connectedPlayers, winner, requestedDecisionType, requestedDecisionData, makeMove, discard };
};


export default useWebSocket;
