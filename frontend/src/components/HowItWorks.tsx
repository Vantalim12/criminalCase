import React from "react";

export const HowItWorks: React.FC = () => {
  return (
    <div className="bg-secondary border-4 border-accent rounded-lg p-8 mb-8 max-w-4xl mx-auto">
      <h2 className="font-heading text-4xl text-gold mb-6 text-center">
        🔍 HOW IT WORKS
      </h2>

      <div className="space-y-6 text-gray-200">
        {/* Step 1 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-heading text-2xl text-primary">
              1
            </div>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-gold mb-2">
              Hold $FIND Tokens
            </h3>
            <p className="text-lg leading-relaxed">
              Acquire $FIND tokens and hold them in your Solana wallet. The more
              you hold, the higher your rank!
            </p>
          </div>
        </div>

        {/* Step 2 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-heading text-2xl text-primary">
              2
            </div>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-gold mb-2">
              Dev Goes Live
            </h3>
            <p className="text-lg leading-relaxed">
              Every 25 minutes, a new round begins. The developer will go live
              and announce the target item to find.
            </p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-heading text-2xl text-primary">
              3
            </div>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-gold mb-2">
              Highest Holder Gets the Chance
            </h3>
            <p className="text-lg leading-relaxed">
              The{" "}
              <span className="text-accent font-bold">
                ANY $FINDCOIN HOLDER
              </span>{" "}
              at the start of each round gets a 3-minute window to find and
              submit a photo of the announced item on livestream!
            </p>
          </div>
        </div>

        {/* Step 4 */}
        <div className="flex gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center font-heading text-2xl text-primary">
              4
            </div>
          </div>
          <div>
            <h3 className="font-heading text-2xl text-gold mb-2">
              Submit & Win
            </h3>
            <p className="text-lg leading-relaxed">
              Find the item IRL, take a photo, and submit it within the 3-minute
              window. If verified, you win the reward!
            </p>
          </div>
        </div>

        {/* Reward Info Box */}
        <div className="mt-8 p-6 bg-primary border-2 border-gold rounded-lg">
          <h3 className="font-heading text-2xl text-gold mb-3 text-center">
            💰 REWARDS
          </h3>
          <p className="text-lg text-center leading-relaxed">
            Rewards are distributed based on{" "}
            <span className="text-accent font-bold">trading volume fees</span>{" "}
            collected during each round.
            <br />
            <span className="text-sm text-gray-400 mt-2 block">
              * The reward pool grows with each transaction, making popular
              rounds more lucrative!
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};
