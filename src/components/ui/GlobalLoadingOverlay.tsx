"use client";

import LoadingScreen from "./LoadingScreen";
import { useGlobalLoadingVisibility } from "@/hooks/useGlobalLoading";

export default function GlobalLoadingOverlay() {
  const isVisible = useGlobalLoadingVisibility();
  return <LoadingScreen isVisible={isVisible} />;
}
