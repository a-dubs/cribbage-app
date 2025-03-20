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

interface PlayingCardProps {
  card: Card;
  hidden: boolean;
  onClick?: () => void;
  isSelected?: boolean;
}
export const PlayingCard = ({ card, hidden, onClick, isSelected }: PlayingCardProps) => {
  const cardImagePath = hidden ? backOfCardPath : convertCardToImagePath(card);
  const cardImageName = hidden ? backOfCardName : convertCardToImageName(card);
  const id = hidden ? '' : card;
  return (
    <div className={`playing-card ${isSelected ? 'selected' : ''}`} onClick={onClick}>
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

export const CardsInPlay = ({ cards, title, isHand, hidden = false }: CardsInPlayProps) => {
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

export interface HandProps {
  cards: Card[];
  title: string;
  selectedCards: Card[];
  setSelectedCards: (cards: Card[]) => void;
  hidden: boolean;
}

export const Hand = ({
  cards,
  title,
  selectedCards,
  setSelectedCards,
  hidden,
}: HandProps) => {
  const handleCardClick = (card: Card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(selectedCard => selectedCard !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  return (
    <div className='hand'>
      <p className='hand-title is-size-4 has-text-light'>{title}</p>
      <div className='hand-content'>
        {
          cards.map((card, index) => {
            return (
              <PlayingCard
                key={index}
                card={card}
                hidden={hidden}
                onClick={() => handleCardClick(card)}
                isSelected={selectedCards.includes(card)}
              />
            );
          })
        }
      </div>
    </div>
  );
}
