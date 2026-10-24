import type { Metadata } from "next";
import { MapExplorer } from "@/components/map/MapExplorer";
import { getTranslator } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: `${t("map.title")} – ${t("common.appName")}` };
}

export default function MapPage() {
  return <MapExplorer />;
}
