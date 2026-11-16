import { createFileRoute } from "@tanstack/react-router";

import { SugarExperience } from "@/components/sugar/SugarExperience";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Know Your Sugar. Protect Your Future." },
      {
        name: "description",
        content:
          "Over 540 million adults live with diabetes and nearly half don't know it. Understand your blood sugar today.",
      },
      { property: "og:title", content: "Know Your Sugar. Protect Your Future." },
      {
        property: "og:description",
        content: "Small numbers, big consequences. Learn how blood sugar shapes long-term health.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SugarExperience,
});
