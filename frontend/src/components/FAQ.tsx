import React, { useState } from "react";

export const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const faqItems = [
    {
      question: "What is $FIND?",
      answer:
        "$FIND is a Solana-based token that powers the Criminal Case IRL Finds game. Holders compete to find real-life items during live submission windows for SOL rewards.",
    },
    {
      question: "How does the game work?",
      answer:
        "Every 25 minutes, a new round begins with a target item announced. The highest $FIND holder gets a 3-minute window to find and submit a photo of the item. If verified, they win SOL rewards!",
    },
    {
      question: "How are rewards calculated?",
      answer:
        "Rewards are based on trading volume: Base reward (0.01 SOL) + Volume bonus (0.5% of 24h volume). Minimum reward is 0.01 SOL, maximum is 1 SOL per round.",
    },
    {
      question: "How do I become the highest holder?",
      answer:
        "Buy and hold more $FIND tokens than anyone else. The system automatically tracks holder balances and ranks them in real-time. The highest holder at the start of each round gets the submission opportunity.",
    },
    {
      question: "What happens if I'm not the highest holder?",
      answer:
        "You can still participate by watching the live feed, checking the leaderboard, and waiting for your chance to become the top holder. The rankings update constantly based on token holdings.",
    },
    {
      question: "How do I submit a photo?",
      answer:
        "When you're the highest holder during a submission window, a photo submission form will automatically appear. Drag & drop or click to upload your find, then submit with your wallet signature.",
    },
    {
      question: "How are submissions verified?",
      answer:
        "All submissions are reviewed by our admin team. Photos must clearly show the target item and be submitted within the 3-minute window. Invalid submissions are rejected.",
    },
    {
      question: "What if I miss the submission window?",
      answer:
        "If you miss the 3-minute window, the opportunity passes to the next round. Make sure you're ready when the submission window opens!",
    },
    {
      question: "How often do rounds happen?",
      answer:
        "New rounds start every 25 minutes. Each round has a 22-minute active period followed by a 3-minute submission window for the highest holder.",
    },
    {
      question: "Where can I buy $FIND tokens?",
      answer:
        "Check our social media channels for the latest information on where to purchase $FIND tokens. Make sure to verify you're buying the correct token contract address.",
    },
    {
      question: "Is this safe?",
      answer:
        "Yes! All transactions are secured by Solana blockchain technology. We use wallet signatures for authentication and never ask for your private keys. Always verify the contract address before trading.",
    },
    {
      question: "What if I have technical issues?",
      answer:
        "Check our troubleshooting guide, ensure your wallet is connected, and verify you have the latest version of your wallet extension. For additional support, reach out through our social channels.",
    },
  ];

  return (
    <div className="bg-secondary border-4 border-accent rounded-lg p-8 mb-8 max-w-4xl mx-auto">
      <h2 className="font-heading text-4xl text-gold mb-6 text-center">
        ❓ FREQUENTLY ASKED QUESTIONS
      </h2>

      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <div
            key={index}
            className="bg-primary border border-gray-600 rounded-lg"
          >
            <button
              onClick={() => toggleItem(index)}
              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-700 transition-colors"
            >
              <h3 className="font-heading text-xl text-gold pr-4">
                {item.question}
              </h3>
              <div className="text-gold text-2xl flex-shrink-0">
                {openItems.includes(index) ? "−" : "+"}
              </div>
            </button>

            {openItems.includes(index) && (
              <div className="px-6 pb-4">
                <p className="text-gray-200 leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Social Links */}
      <div className="mt-8 p-6 bg-primary border-2 border-gold rounded-lg text-center">
        <h3 className="font-heading text-2xl text-gold mb-4">🔗 FOLLOW US</h3>
        <div className="flex justify-center items-center gap-4">
          <a
            href="https://x.com/findcoin67"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            @findcoin67
          </a>
        </div>
        <p className="text-gray-400 text-sm mt-3">
          Stay updated with the latest news, announcements, and community
          updates!
        </p>
      </div>

      {/* Contract Address Reminder */}
      <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-600 rounded-lg text-center">
        <h4 className="font-heading text-lg text-yellow-400 mb-2">
          ⚠️ IMPORTANT SECURITY REMINDER
        </h4>
        <p className="text-yellow-200 text-sm">
          Always verify the contract address before trading. Only buy $FIND
          tokens from official sources. Never share your private keys or seed
          phrases with anyone.
        </p>
      </div>
    </div>
  );
};
