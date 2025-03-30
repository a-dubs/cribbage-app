// import { io, Socket } from 'socket.io-client';
// import { GameState, GameEvent, emittedMakeMoveRequest, emittedDiscardRequest, Card } from 'cribbage-core';

// class WebSocketService {
//   private socket: Socket;
//   private gameState: GameState | null = null;
//   private recentGameEvent: GameEvent | null = null;

//   constructor() {
//     this.socket = io('http://localhost:3000');

//     this.socket.on('gameStateChange', (newGameState: GameState) => {
//       this.gameState = newGameState;
//     });

//     this.socket.on('gameEvent', (gameEvent: GameEvent) => {
//       this.recentGameEvent = gameEvent;
//     });

//     this.socket.on('gameOver', (message: string) => {
//       console.log(message);
//     });

//     this.socket.on('requestMakeMove', (data: emittedMakeMoveRequest) => {
//       // Handle move request from server
//       const selectedCard = this.handleMakeMove(data);
//       this.socket.emit('makeMoveResponse', { playerId: data.playerId, selectedCard });
//     });

//     this.socket.on('discard', (data: emittedDiscardRequest) => {
//       // Handle discard request from server
//       const selectedCards = this.handleDiscard(data);
//       this.socket.emit('discardResponse', { playerId: data.playerId, selectedCards });
//     });
//   }

//   getGameState(): GameState | null {
//     return this.gameState;
//   }

//   getRecentGameEvent(): GameEvent | null {
//     return this.recentGameEvent;
//   }

//   login(username: string, name: string) {
//     this.socket.emit('login', { username, name });
//   }

//   startGame() {
//     this.socket.emit('startGame');
//   }

//   handleMakeMove(data: emittedMakeMoveRequest): Card {
//     // Implement logic to select a card to play
//     return data.peggingHand[0]; // Example: always play the first card
//   }

//   handleDiscard(data: emittedDiscardRequest): Card[] {
//     // Implement logic to select cards to discard
//     return data.hand.slice(0, 2); // Example: always discard the first two cards
//   }
// }

// const webSocketService = new WebSocketService();
// export default webSocketService;
