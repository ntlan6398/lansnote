import { useState } from "react";
import Flip from "react-card-flip";

const FlashCard = ({ term }: { term: any | undefined }) => {
  const [isFlipped, setIsFlipped] = useState(
    term?.repetition % 2 !== 0 || term?.repetition === undefined,
  );
  if (term?.audio && !isFlipped) {
    new Audio(term?.audio).play();
  }
  return (
    <div className="w-full h-[24rem] md:h-[32rem] rounded-lg">
      {term !== undefined ? (
        <Flip
          isFlipped={isFlipped}
          flipDirection="vertical"
          containerClassName="w-full h-full"
        >
          <div
            className="p-8 w-full h-full flex flex-col justify-center items-center text-center bg-[#DBE2EF] rounded-lg gap-4"
            key="front"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-2xl md:text-4xl font-bold">{term.term}</div>
            {term.phonetic && (
              <div className="text-lg md:text-xl">{term.phonetic}</div>
            )}
            <div className="text-lg md:text-xl">Example: {term.example}</div>
          </div>
          <div
            className="p-8w-full h-full flex flex-col justify-center items-center text-center bg-[#DBE2EF] rounded-lg gap-4"
            key="back"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <div className="text-2xl md:text-4xl font-bold">
              {term.definition}
            </div>
            <div className="text-lg md:text-xl">{term.type}</div>
          </div>
        </Flip>
      ) : (
        <div className="w-full h-[24rem] md:h-[32rem] rounded-lg bg-[#DBE2EF]">
          <div className="p-8 w-full h-full flex flex-col justify-center items-center text-center bg-[#DBE2EF] rounded-lg gap-4">
            <div className="text-2xl md:text-4xl font-bold">
              You finished all the terms
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard;
