import { Document } from "@react-pdf/renderer";
import { CommitmentsPage } from "./pages/CommitmentsPage";
import { CostChartPage } from "./pages/CostChartPage";
import { CostTablePage } from "./pages/CostTablePage";
import { CoverPage } from "./pages/CoverPage";
import { FindingsPage } from "./pages/FindingsPage";
import { RecommendationPage } from "./pages/RecommendationPage";
import { RoiPage } from "./pages/RoiPage";
import { ScenarioTablePage } from "./pages/ScenarioTablePage";
import { WhyPage } from "./pages/WhyPage";
import type { ReportViewModel } from "./view-model";

/** Les 9 pages du rapport, dans l'ordre du modèle BEG. */
export function ReportDocument({ vm }: { vm: ReportViewModel }) {
  return (
    <Document
      title={`Diagnostic énergétique – ${vm.meta.companyName}`}
      author="Solarity Green"
      subject="Résultats de l'étude technico-économique et scénarios d'investissement"
      language="fr"
      creationDate={vm.meta.generatedAt}
      modificationDate={vm.meta.generatedAt}
    >
      <CoverPage vm={vm} />
      <WhyPage vm={vm} />
      <FindingsPage vm={vm} />
      <CostChartPage vm={vm} />
      <CostTablePage vm={vm} />
      <ScenarioTablePage vm={vm} />
      <RoiPage vm={vm} />
      <RecommendationPage vm={vm} />
      <CommitmentsPage vm={vm} />
    </Document>
  );
}
