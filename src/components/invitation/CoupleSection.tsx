import React from "react";
import Image from "next/image";
import { Instagram, Heart } from "lucide-react";

interface CoupleSectionProps {
  bride: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
  groom: {
    name: string;
    fullName: string;
    father: string;
    mother: string;
    photo: string;
    instagram?: string;
  };
}

export const CoupleSection: React.FC<CoupleSectionProps> = ({ bride, groom }) => {
  return (
    <section className="py-20 px-4 max-w-4xl mx-auto text-center space-y-16">
      {/* Holy Verse / Quote */}
      <div className="max-w-2xl mx-auto space-y-4 p-8 rounded-3xl bg-white/60 backdrop-blur-sm border border-gold/20 shadow-sm">
        <span className="text-2xl text-gold font-serif">❝</span>
        <p className="font-serif-luxury text-sm sm:text-base text-plum/90 leading-relaxed italic">
          Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.
        </p>
        <span className="text-xs uppercase tracking-widest text-gold-dark font-bold block pt-1">
          — Q.S. Ar-Rum: 21 —
        </span>
      </div>

      {/* Couple Showcase */}
      <div className="space-y-4">
        <h2 className="font-serif-luxury text-3xl sm:text-4xl text-plum font-bold">
          Kedua Mempelai
        </h2>
        <p className="text-xs uppercase tracking-widest text-plum-light font-medium">
          Dengan memohon ridho & restu Allah SWT
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* The Bride */}
        <div className="space-y-4 p-6 rounded-3xl bg-white/70 border border-gold/25 shadow-sm transition-transform hover:-translate-y-1">
          <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-lg border-2 border-gold/50 p-1">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={bride.photo}
                alt={bride.fullName}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
              The Bride
            </span>
            <h3 className="font-serif-luxury text-2xl text-plum font-bold">
              {bride.fullName}
            </h3>
            <p className="text-xs text-plum-light leading-relaxed pt-1">
              Putri tercinta dari <br />
              <strong className="text-plum">{bride.father}</strong> &{" "}
              <strong className="text-plum">{bride.mother}</strong>
            </p>
          </div>
          {bride.instagram && (
            <a
              href={`https://instagram.com/${bride.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gold-dark hover:underline font-medium"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>{bride.instagram}</span>
            </a>
          )}
        </div>

        {/* The Groom */}
        <div className="space-y-4 p-6 rounded-3xl bg-white/70 border border-gold/25 shadow-sm transition-transform hover:-translate-y-1">
          <div className="relative w-44 h-44 mx-auto rounded-full overflow-hidden shadow-lg border-2 border-gold/50 p-1">
            <div className="relative w-full h-full rounded-full overflow-hidden">
              <Image
                src={groom.photo}
                alt={groom.fullName}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-gold-dark font-semibold">
              The Groom
            </span>
            <h3 className="font-serif-luxury text-2xl text-plum font-bold">
              {groom.fullName}
            </h3>
            <p className="text-xs text-plum-light leading-relaxed pt-1">
              Putra tercinta dari <br />
              <strong className="text-plum">{groom.father}</strong> &{" "}
              <strong className="text-plum">{groom.mother}</strong>
            </p>
          </div>
          {groom.instagram && (
            <a
              href={`https://instagram.com/${groom.instagram.replace("@", "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gold-dark hover:underline font-medium"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>{groom.instagram}</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};
