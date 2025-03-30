import React from 'react';
import { Card } from 'cribbage-core';
import './PlayingCard.css';

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
  card: Card | null;
  hidden: boolean;
  onClick?: () => void;
  isSelected?: boolean;
  isSelectable?: boolean;
}
export const PlayingCard = ({ card, hidden, onClick, isSelected, isSelectable }: PlayingCardProps) => {
  const cardImagePath = hidden || card === null ? backOfCardPath : convertCardToImagePath(card);
  const cardImageName = hidden || card === null ? backOfCardName : convertCardToImageName(card);
  const id = hidden || card === null ? backOfCardName : card;
  return (
    <div className={`playing-card ${isSelected ? 'selected' : ''} ${isSelectable ? 'selectable' : ''}`} onClick={onClick}>
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


export interface CardStackProps {
  /** Array of elements (cards) to render in the stack */
  items: React.ReactNode[];
  /** Horizontal offset (in percentage) between each card. Default is 25 */
  offset?: number;
  /** Whether to enable the hover animation. Default is true */
  hoverAnimation?: boolean;
}

export const CardStack: React.FC<CardStackProps> = ({
  items,
  offset = 30,
  hoverAnimation = false,
}) => {
  return (
    <div className="card-stack">
      {items.map((item, index) => (
        <div
          key={index}
          className={`card-stack-item ${hoverAnimation ? 'hover-enabled' : ''}`}
          style={{
            left: `${index * offset}px`,
            zIndex: index, // lower index is at the bottom of the stack
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export interface DeckProps {
  stackSize: number;
  topCard: Card | null;
  onClick?: () => void;
}

// create a deck using the card stack component
export const Deck: React.FC<DeckProps> = ({ stackSize, topCard, onClick }) => {
  const deckItems = [];
  for (let i = 0; i < stackSize; i++) {
    deckItems.push(
      <PlayingCard
        key={i}
        card={null}
        hidden={true}
      />
    );
  }
  if (topCard) {
    deckItems.push(
      <PlayingCard
        key={stackSize}
        card={topCard}
        hidden={false}
        isSelected={false}
      />
    );
  }

  return (
    <div onClick={onClick}>
      <CardStack items={deckItems} hoverAnimation={false} offset={3} />
    </div>
  );
}


// Stacked Hand component
export interface StackedHandProps {
  cards: Card[];
  title: string;
  selectedCards: Card[];
  setSelectedCards: (cards: Card[]) => void;
  hidden: boolean;
  stackOffset?: number;
  hoverAnimation?: boolean;
  areSelectable?: boolean;
}

export const StackedHand = ({
  cards,
  title,
  selectedCards,
  setSelectedCards,
  hidden,
  stackOffset,
  hoverAnimation = false,
  areSelectable,
}: StackedHandProps) => {
  const handleCardClick = (card: Card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(selectedCard => selectedCard !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const items = cards.map((card, index) => (
    <PlayingCard
      key={index}
      card={card}
      hidden={hidden}
      onClick={() => handleCardClick(card)}
      isSelected={selectedCards.includes(card)}
      isSelectable={areSelectable}
    />
  ));

  return (
    <div className='hand'>
      <p className='hand-title is-size-4 has-text-light'>{title}</p>
      <CardStack items={items} offset={stackOffset} hoverAnimation={hoverAnimation} />
    </div>
  );


}

