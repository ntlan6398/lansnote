import { useState } from "react";
import Flip from "react-card-flip";
import { IoReloadSharp } from "react-icons/io5";

const FlashCard = ({ term }: { term: any | undefined }) => {
  const [isFlipped, setIsFlipped] = useState(false);
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
              You finished all the terms.
            </div>
            <button
              className="flex items-center justify-center gap-2 p-2 rounded-lg"
              onClick={() => {}}
            >
              <IoReloadSharp className="text-2xl md:text-4xl" />
            </button>
            <div className="text-base md:text-lg">Reload for more terms</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashCard;
