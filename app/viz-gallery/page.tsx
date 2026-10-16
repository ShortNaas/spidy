import React from "react";
import { notFound } from "next/navigation";
import { VizGalleryClient } from "@/components/viz/VizGalleryClient";

export default function VizGalleryPage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return <VizGalleryClient />;
}
