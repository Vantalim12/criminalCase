import React from "react";
import { FindsGallery } from "../components/FindsGallery";

const GalleryPage: React.FC = () => {
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-heading text-5xl text-gold mb-4">
          EVIDENCE GALLERY
        </h1>
        <p className="text-lg text-gray-300">
          Browse all approved finds from past rounds
        </p>
      </div>

      <FindsGallery />
    </div>
  );
};

export default GalleryPage;
