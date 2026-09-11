"use client";

import React from "react";
import { DedicatedTemplateProps } from "@/lib/templates/types";
import { GardenArchFrame, PressedFlowerDivider } from "@/components/invitation/svg/autumnelle";

export const AutumnelleCouple: React.FC<{
  bride: DedicatedTemplateProps["bride"];
  groom: DedicatedTemplateProps["groom"];
  theme: DedicatedTemplateProps["theme"];
}> = ({ bride, groom, theme }) => {
  const primaryColor = theme.colors.primary || "#5C6F57";

  return (
    <section id="couple" className="py-16 px-4 max-w-2xl mx-auto space-y-12 text-center">
      <PressedFlowerDivider color={primaryColor} />

      <div className="space-y-3">
        <span
          className="text-xs font-serif font-bold uppercase tracking-widest"
          style={{ color: primaryColor }}
        >
          Mempelai Bahagia
        </span>
        <h2
          className="text-2xl sm:text-3xl font-serif font-bold"
          style={{ color: theme.colors.text || "#261F23" }}
        >
          Dua Hati dalam Satu Janji Suci
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
        {/* Bride */}
        <div className="space-y-4">
          <GardenArchFrame size={200} color={primaryColor}>
            <img
              src={bride.photo}
              alt={bride.fullName}
              className="w-full h-full object-cover object-top"
            />
          </GardenArchFrame>
          <div className="space-y-1">
            <h3
              className="font-serif font-bold text-lg"
              style={{ color: theme.colors.text || "#261F23" }}
            >
              {bride.fullName}
            </h3>
            <p className="text-xs text-stone-500 font-serif">Putri tercinta dari</p>
            <p className="text-xs font-serif font-medium text-stone-700">
              {bride.father} &amp; {bride.mother}
            </p>
          </div>
        </div>

        {/* Groom */}
        <div className="space-y-4">
          <GardenArchFrame size={200} color={primaryColor}>
            <img
              src={groom.photo}
              alt={groom.fullName}
              className="w-full h-full object-cover object-top"
            />
          </GardenArchFrame>
          <div className="space-y-1">
            <h3
              className="font-serif font-bold text-lg"
              style={{ color: theme.colors.text || "#261F23" }}
            >
              {groom.fullName}
            </h3>
            <p className="text-xs text-stone-500 font-serif">Putra tercinta dari</p>
            <p className="text-xs font-serif font-medium text-stone-700">
              {groom.father} &amp; {groom.mother}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
