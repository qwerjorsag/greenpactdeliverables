import fs from "fs";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { METHODOLOGY_VERSION } from "../../../src/shared/ruleset";
import { getServerT } from "../../../src/i18n/server";

export async function generateSubmissionPdf(data: any) {
  const filename = `report_${data.submissionId}.pdf`;
  const reportsDir = path.join(process.cwd(), "reports");
  const filePath = path.join(reportsDir, filename);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = pdfDoc.addPage();
  const { height } = page.getSize();
  const fontSize = 12;

  const lang = data.language === "de" ? "de" : data.language === "cs" ? "cs" : "en";
  const t = getServerT(lang, "pdf");

  page.drawText(t("serverReport.title"), {
    x: 50,
    y: height - 50,
    size: 20,
    font: timesRomanFont,
    color: rgb(0, 0.5, 0.2),
  });

  const lines = [
    `${t("serverReport.id")}: ${data.submissionId}`,
    `${t("serverReport.date")}: ${new Date().toLocaleString(lang === "cs" ? "cs-CZ" : lang === "de" ? "de-DE" : "en-US")}`,
    `${t("serverReport.version")}: ${METHODOLOGY_VERSION}`,
    `${t("serverReport.acc")}: ${data.details.name}`,
    `${t("serverReport.type")}: ${data.type}`,
    "",
    `${t("serverReport.kpis")}:`,
    `- ${t("serverReport.rating")}: ${data.computed.overallRating}`,
    `- ${t("serverReport.energy")}: ${data.computed.energyPerGuest} kWh`,
    `- ${t("serverReport.water")}: ${data.computed.waterPerGuest} m3`,
    `- ${t("serverReport.waste")}: ${data.computed.wasteRecyclingRate}%`,
    "",
    `${t("serverReport.recs")}:`,
    ...data.computed.recommendations.map((rec: string) => `- ${rec}`),
  ];

  let yOffset = height - 100;
  for (const line of lines) {
    page.drawText(line, {
      x: 50,
      y: yOffset,
      size: fontSize,
      font: timesRomanFont,
      color: rgb(0, 0, 0),
    });
    yOffset -= 20;
  }

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);
  return filePath;
}
