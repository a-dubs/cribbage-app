import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { GameState, GameEvent, EmittedMakeMoveRequest, EmittedDiscardRequest, Card, EmittedWaitingForPlayer, EmittedDiscardResponse, EmittedMakeMoveResponse, PlayerIdAndName, AgentDecisionType, EmittedDecisionRequest, ActionType } from 'cribbage-core/';
import { EmittedContinueResponse } from 'cribbage-core';

localStorage.debug = 'socket.io-client:socket';
const apiUrl = process.env.REACT_APP_API_URL;
console.log('api url:', apiUrl);
if (!apiUrl) {
  throw new Error('REACT_APP_API_URL is not set');
}

const useWebSocket = (playerId: string, playerName: string) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [lobbyId, setLobbyId] = useState<string | null>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [recentGameEvent, setRecentGameEvent] = useState<GameEvent | null>(null);
  const [waitingOnPlayerInfo, setWaitingOnPlayerInfo] = useState<EmittedWaitingForPlayer | null>(null);
  const [connectedPlayers, setConnectedPlayers] = useState<PlayerIdAndName[]>([]);
  const [winner, setWinner] = useState<string | null>(null);
  const [requestedDecisionType, setRequestedDecisionType] = useState<AgentDecisionType | null>(null);
  const [requestedDecisionData, setRequestedDecisionData] = useState<EmittedDecisionRequest | null>(null);
  const [numberOfCardsToSelect, setNumberOfCardsToSelect] = useState<number | null>(null);
  const [playAgainVotes, setPlayAgainVotes] = useState<string[]>([]);
  // List of "scoring" relevant GameEvents for the past round
  // aka any events that occur in the pegging phase or counting phase 
  const [currentRoundGameEvents, setCurrentRoundGameEvents] = useState<GameEvent[]>([]);

  const resetState = () => {
    console.log('Resetting state');
    setGameState(null);
    setRecentGameEvent(null);
    setWaitingOnPlayerInfo(null);
    // setConnectedPlayers([]);
    setWinner(null);
    setRequestedDecisionType(null);
    setRequestedDecisionData(null);
    setNumberOfCardsToSelect(null);
    setPlayAgainVotes([]);
    setCurrentRoundGameEvents([]);
  }

  // log when playerId or playerName changes
  const playerIdRef = useRef(playerId);
  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  const prevGameEventRef = useRef<GameEvent | null>(null);
  useEffect(() => {
    if (recentGameEvent && recentGameEvent !== prevGameEventRef.current) {
      console.log("[useEffect] Received new Game Event:", recentGameEvent);
      prevGameEventRef.current = recentGameEvent;
    }
    if (recentGameEvent && recentGameEvent.actionType === ActionType.WIN) {
      console.log("Game over! Winner:", recentGameEvent.playerId);
      setWinner(recentGameEvent.playerId);
    }
  }, [recentGameEvent]);

  const prevDecisionDataRef = useRef<EmittedDecisionRequest | null>(null);
  useEffect(() => {
    if (requestedDecisionData && requestedDecisionData !== prevDecisionDataRef.current) {
      console.log('Received decision request:', requestedDecisionData);
      prevDecisionDataRef.current = requestedDecisionData;
    }
  }, [requestedDecisionData]);

  const prevWaitingOnPlayerInfoRef = useRef<EmittedWaitingForPlayer | null>(null);
  useEffect(() => {
    if (waitingOnPlayerInfo && waitingOnPlayerInfo !== prevWaitingOnPlayerInfoRef.current) {
      console.log('Waiting on player:', waitingOnPlayerInfo);
      prevWaitingOnPlayerInfoRef.current = waitingOnPlayerInfo;
    }
  }, [waitingOnPlayerInfo]);

  const prevGameStateRef = useRef<GameState | null>(null);
  useEffect(() => {
    if (gameState && gameState !== prevGameStateRef.current) {
      console.log('Received new game state:', gameState);
      prevGameStateRef.current = gameState;
    }
  }, [gameState]);

  const joinLobby = (playerId: string, lobbyId: string) => {
    if (!socket) return console.error('Socket not connected');
    setLobbyId(lobbyId);
    socket.emit('joinLobby', { playerId, lobbyId });
  };

  const checkReconnect = (playerId: string, onFoundLobby: (lobbyId: string) => void) => {
    if (!socket) return console.error('Socket not connected');
    socket.emit('checkReconnect', playerId);
    socket.once('reconnectInfo', ({ lobbyId }) => {
      if (lobbyId) {
        console.log('Auto-reconnecting to lobby:', lobbyId);
        setLobbyId(lobbyId);
        onFoundLobby(lobbyId);
      }
    });
  };

  const leaveLobby = () => {
    if (!socket) return console.error('Socket not connected');
    socket.emit('leaveLobby');
    setLobbyId(null);
  };

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
      newSocket = io(apiUrl, {
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
      console.log('Received new game state:', newGameState);
      setGameState(newGameState);
    });

    newSocket.on('gameEvent', (gameEvent: GameEvent) => {
      console.log("Received new game event:", gameEvent)
      setRecentGameEvent(gameEvent);
    });

    // newSocket.on('gameOver', (winner: string) => {
    //   console.log(`Game over! Winner: ${winner}`);
    //   setWinner(winner);
    // });

    newSocket.on('gameStart', (data: { gameId: string; players: PlayerIdAndName[] }) => {
      resetState();
      console.log(`Game '${data.gameId}' started!`);
      setConnectedPlayers(data.players);
    });

    newSocket.on('requestMakeMove', (data: EmittedMakeMoveRequest) => {
      if (data.playerId !== playerIdRef.current) {
        console.error(`Received make move request for ${data.playerId} but expected ${playerIdRef.current}. Ignoring.`);
        return;
      }
      setRequestedDecisionType(AgentDecisionType.PLAY_CARD);
      setRequestedDecisionData(data);
      setNumberOfCardsToSelect(1);
    });

    newSocket.on('discardRequest', (data: EmittedDiscardRequest) => {
      if (data.playerId !== playerIdRef.current) {
        console.error(`Received discard request for ${data.playerId} but expected ${playerIdRef.current}. Ignoring.`);
        return;
      }
      setRequestedDecisionType(AgentDecisionType.DISCARD);
      setRequestedDecisionData(data);
      setNumberOfCardsToSelect(data.numberOfCardsToDiscard);
    });

    newSocket.on('continueRequest', (data: EmittedDecisionRequest) => {
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

    newSocket.on('currentRoundGameEvents', (events: GameEvent[]) => {
      console.log('Current round game events:', events);
      setCurrentRoundGameEvents(events);
    });

    newSocket.on('playAgainVotes', (votes: string[]) => {
      console.log('Play again votes:', votes);
      setPlayAgainVotes(votes);
    });

    newSocket.on('playerDisconnected', ({ playerId }) => {
      console.log('Player disconnected:', playerId);
    });

    newSocket.on('activeLobbies', ({ lobbyIds }) => {
      console.log('Active lobbies:', lobbyIds);
    });

    setSocket(newSocket);

  }, [playerId, playerName, socket]); 


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

  const playAgain = () => {
    if (!socket) {
      console.error('Socket is not connected. Cannot send play again request.');
      return;
    }
    console.log('Sending play again request');
    socket.emit('playAgain');
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
    currentRoundGameEvents,
    playAgain,
    playAgainVotes,
    lobbyId,
    joinLobby,
    checkReconnect,
    leaveLobby,
  };
};


export default useWebSocket;
