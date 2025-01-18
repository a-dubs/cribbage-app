import React from 'react';
import { Card } from 'cribbage-core/src/types';
import './style.css';

const cardNameMap: { [key: string]: string } = {
  two: '2',
  three: '3',
  four: '4',
  five: '5',
  six: '6',
  seven: '7',
  eight: '8',
  nine: '9',
  ten: '10',
  jack: 'jack',
  queen: 'queen',
  king: 'king',
  ace: 'ace'
};

const backOfCardPath = '/assets/cards/png/back.png';
const backOfCardName = 'back_of_card';

function convertCardToImageName(card: Card) {
  const cardName = card.split('_')[0];
  const cardSuit = card.split('_')[1];
  const convertedCardName = cardNameMap[cardName.toLowerCase()] || cardName;
  return `${convertedCardName}_of_${cardSuit.toLowerCase()}`;
}

function convertCardToImagePath(card: Card) {
  const cardName = card.split('_')[0];
  const cardSuit = card.split('_')[1];
  const convertedCardName = cardNameMap[cardName.toLowerCase()] || cardName;
  return `/assets/cards/png/${convertedCardName}_of_${cardSuit.toLowerCase()}.png`;
}
export const PlayingCard = ({ card, hidden = false }: { card: Card, hidden?: boolean }) => {
  const cardImagePath = hidden ? backOfCardPath : convertCardToImagePath(card);
  const cardImageName = hidden ? backOfCardName : convertCardToImageName(card);
  const id = hidden ? '' : card;
  return (
    <div className='playing-card'>
      <img
        className='playing-card-image'
        src={cardImagePath}
        alt={cardImageName}
        id={id}
      />
    </div>
  );
};

// export const Hand = ({ cards, title }: { cards: Card[], title: string }) => {
//   return (
//     <div className='hand'>
//       <p className='hand-title is-size-4 has-text-light'>{title}</p>
//       <div className='hand-content'>
//         {cards.map((card, index) => (
//           <PlayingCard key={index} card={card} />
//         ))}
//       </div>
//     </div>
//   );
// }

export interface CardsInPlayProps {
  cards: Card[];
  title?: string;
  isHand: boolean;
  hidden?: boolean;
}

export const CardsInPlay = ({ cards, title, isHand, hidden=false }: CardsInPlayProps) => {
  return (
    <div className={`cards-in-play ${isHand ? 'is-hand' : 'is-played'}`}>
      {title && <p className='cards-in-play-title is-size-4 has-text-light'>{title}</p>}
      <div className='cards-in-play-content'>
      {cards.map((card, index) => (
        <PlayingCard key={index} card={card} hidden={hidden} />
      ))}
      </div>
    </div>
  );
}
