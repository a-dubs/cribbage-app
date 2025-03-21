import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, EmittedMakeMoveRequest, EmittedDiscardRequest, Card, EmittedWaitingForPlayer, EmittedDiscardResponse, EmittedMakeMoveResponse, PlayerIdAndName, AgentDecisionType, EmittedDecisionRequest } from 'cribbage-core/';
import { EmittedContinueResponse } from 'cribbage-core/src/types';

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
  const [numberOfCardsToSelect, setNumberOfCardsToSelect] = useState<number | null>(null);

  // log when playerId or playerName changes
  const playerIdRef = useRef(playerId);
  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    let newSocket: Socket;
    console.log('[useWebSocket.useEffect] Player ID:', playerId);
    if (socket) {
      // console.log('Socket already connected. Skipping connection setup.');
      console.log('Socket already connected. Updating existing socket.');
      newSocket = socket;
    }
    else {
      console.log('Connecting to server...');
      newSocket = io('http://localhost:3002', {
        // transports: ['websocket'],
        withCredentials: true,
        auth: {
          token: 'dummy-auth-token', // Add dummy auth token
        },
      });
    }

    newSocket.on('connect_error', (err) => {
      console.error('Connection error:', err);
    });

    newSocket.on('connect_timeout', () => {
      console.error('Connection timeout');
    });

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
      console.log('[socket.requestMakeMove] current player ID:', playerIdRef.current);
      console.log('Received make move request:', data);
      if (data.playerId !== playerIdRef.current) {
        console.error(`Received make move request for ${data.playerId} but expected ${playerIdRef.current}. Ignoring.`);
        return;
      }
      setRequestedDecisionType(AgentDecisionType.PLAY_CARD);
      setRequestedDecisionData(data);
      setNumberOfCardsToSelect(1);
    });

    newSocket.on('discardRequest', (data: EmittedDiscardRequest) => {
      console.log('[handleReceivedDiscardRequest] current player ID:', playerIdRef.current);
      console.log('Received discard request:', data);
      if (data.playerId !== playerIdRef.current) {
        console.error(`Received discard request for ${data.playerId} but expected ${playerIdRef.current}. Ignoring.`);
        return;
      }
      setRequestedDecisionType(AgentDecisionType.DISCARD);
      setRequestedDecisionData(data);
      setNumberOfCardsToSelect(data.numberOfCardsToDiscard);
    });

    newSocket.on('continueRequest', (data: EmittedDecisionRequest) => {
      console.log('[handleReceivedContinueRequest] current player ID:', playerIdRef.current);
      console.log('Received continue request:', data);
      if (data.playerId !== playerIdRef.current) {
        console.error(`Received continue request for ${data.playerId} but expected ${playerIdRef.current}. Ignoring.`);
        return;
      }
      setRequestedDecisionType(AgentDecisionType.CONTINUE);
      setRequestedDecisionData(data);
      setNumberOfCardsToSelect(0);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      // delete the socket
      setSocket(null);
    });

    newSocket.on('connect', () => {
      console.log('Connected to server with socket ID:', newSocket.id);
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

    setSocket(newSocket);

    // return () => {
    //   console.log('Closing socket connection');
    //   newSocket.close();
    // };
  }, [playerId, playerName, socket]); 

  // // send heartbeat to server every 5 seconds
  // useEffect(() => {
  //   const heartbeatInterval = setInterval(() => {
  //     console.log('Sending heartbeat');
  //     socket?.emit('heartbeat');
  //   }, 5000);

  //   return () => {
  //     clearInterval(heartbeatInterval);
  //   };
  // }, [socket]);


  const makeMove = (card: Card | null): void => {
    // null = Go/Pass
    if (!card) {
      console.log('Passing');
    }
    else {
      console.log('Playing card:', card);
    }
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

  const continueGame = () => {
    console.log('Continuing');
    if (!socket) {
      console.error('Socket is not connected. Cannot continue.');
      return;
    }
    const continueResponse: EmittedContinueResponse = { playerId };
    socket.emit('continueResponse', continueResponse);
  };

  const login = (name: string, username: string) => {
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

  return {
    gameState,
    recentGameEvent,
    login,
    startGame,
    waitingOnPlayerInfo,
    connectedPlayers,
    winner,
    requestedDecisionType,
    requestedDecisionData,
    numberOfCardsToSelect,
    makeMove,
    discard,
    continueGame,
  };
};


export default useWebSocket;
