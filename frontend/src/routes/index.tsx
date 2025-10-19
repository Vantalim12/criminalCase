import React from "react";
import { LiveFeed } from "../components/LiveFeed";
import { Stats } from "../components/Stats";

const IndexPage: React.FC = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-heading text-6xl text-gold mb-4">
          CRIMINAL CASE: IRL FINDS
        </h1>
        <p className="text-xl text-gray-300 max-w-3xl mx-auto">
          Hold $DISCOVER tokens and become the highest holder to get a chance to
          find real-life items during 3-minute submission windows every 25
          minutes!
        </p>
      </div>

      <Stats />

      <LiveFeed />
    </div>
  );
};

export default IndexPage;
