import nlp from "compromise";
import { FiMessageSquare } from "react-icons/fi";
export async function lookupWord(word) {
  // Get the base form of the word
  const doc = nlp(word);

  let baseForm = word;

  // Try different word forms
  if (doc.verbs().found) {
    baseForm = doc.verbs().toInfinitive().text();
  } else if (doc?.nouns().found) {
    baseForm = doc.nouns().toSingular().text();
  } else if (doc?.adjectives().found) {
    baseForm = doc.adjectives().text();
  }

  // Fetch dictionary data with the base form
  try {
    const response = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${baseForm}`,
    );
    const data = await response.json();
    return data[0];
  } catch (error) {
    console.error("Failed to fetch dictionary data:", error);
    return null;
  }
}
// Add these dictionary URL helper functions at the top of your component
const getDictionaryUrls = (word) => [
  {
    name: "Oxford",
    url: `https://www.oxfordlearnersdictionaries.com/definition/english/${word}`,
    logo: "https://www.oxfordlearnersdictionaries.com/external/images/home_2020/OLD_home_productsOALD.png?version=2.3.67",
  },
  {
    name: "Cambridge",
    url: `https://dictionary.cambridge.org/dictionary/english/${word}`,
    logo: "https://cdn.freebiesupply.com/logos/large/2x/university-of-cambridge-2-logo-png-transparent.png",
  },
  {
    name: "Longman",
    url: `https://www.ldoceonline.com/dictionary/${word}`,
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRGHeMd4af0p9Q-oxelVcZYhh8_NXX_NsBO5A&s",
  },
];

export default function Dictionary({
  popupRef,
  optionsPosition,
  setShowDictionaryPopup,
  selectedText,
  dictionaryData,
  handleAddCommentFromDefinition,
}) {
  let styleTop = {
    top: `${optionsPosition.top}px`,
    left: `${optionsPosition.left}px`,
    width: "300px",
    maxHeight: "400px",
    overflowY: "auto",
  };

  let styleBottom = {
    bottom: `${optionsPosition.bottom}px`,
    left: `${optionsPosition.left}px`,
    width: "300px",
    maxHeight: "400px",
    overflowY: "auto",
  };
  return (
    <div
      ref={popupRef}
      className="fixed z-50 bg-white shadow-xl rounded-md p-4"
      style={optionsPosition?.bottom ? styleBottom : styleTop}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium">Dictionary</span>
        <div className="flex gap-2">
          {/* External dictionary links */}
          <div className="flex gap-1">
            {getDictionaryUrls(selectedText).map(({ name, url, logo }) => (
              <a
                key={name}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded capitalize"
                title={`Look up in ${name} dictionary`}
              >
                <img src={logo} alt={name} className="w-4 h-4" />
              </a>
            ))}
          </div>
          <button
            onClick={() => setShowDictionaryPopup(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      </div>

      <div className="text-sm">
        {dictionaryData ? (
          <div>
            <div className="mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">{dictionaryData.word}</h3>
                {dictionaryData.phonetics?.some((p) => p.audio) && (
                  <button
                    onClick={() => {
                      const audio = dictionaryData.phonetics.find(
                        (p) => p.audio,
                      )?.audio;
                      if (audio) {
                        new Audio(audio).play();
                      }
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    🔊
                  </button>
                )}
              </div>
              {dictionaryData.phonetic && (
                <span className="text-gray-500">{dictionaryData.phonetic}</span>
              )}
            </div>

            {dictionaryData.meanings.map((meaning, index) => (
              <div key={index} className="mb-4">
                <div className="font-semibold text-blue-600 mb-2">
                  {meaning.partOfSpeech}
                  {meaning.synonyms?.length > 0 && (
                    <div className="text-sm font-normal text-gray-600 mt-1">
                      Synonyms: {meaning.synonyms.slice(0, 5).join(", ")}
                    </div>
                  )}
                </div>
                {meaning.definitions.map((def, idx) => (
                  <div key={idx} className="mb-3 p-2 bg-gray-50 rounded-md">
                    <div className="mb-1">
                      <span className="font-medium text-gray-700">
                        {idx + 1}.{" "}
                      </span>
                      {def.definition}
                    </div>
                    {def.example && (
                      <div className="text-gray-600 italic pl-4 text-sm border-l-2 border-gray-200 mt-1">
                        "{def.example}"
                      </div>
                    )}
                    {def.synonyms?.length > 0 && (
                      <div className="text-sm text-gray-500 mt-1">
                        Similar: {def.synonyms.slice(0, 3).join(", ")}
                      </div>
                    )}
                    <button
                      onClick={() =>
                        handleAddCommentFromDefinition(
                          dictionaryData.word,
                          def,
                          meaning.partOfSpeech,
                        )
                      }
                      className="mt-2 text-sm text-blue-500 hover:text-blue-600 flex items-center gap-1"
                    >
                      <FiMessageSquare className="w-3 h-3" />
                      Add Comment
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">Loading...</div>
        )}
      </div>
    </div>
  );
}
