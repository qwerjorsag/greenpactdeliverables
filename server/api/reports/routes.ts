import fs from "fs";
import type { RegisterRoutes } from "../types";
import { localDb } from "../../localDb";

export const registerReportRoutes: RegisterRoutes = (app) => {
  app.get("/api/report/:submissionId", async (req, res) => {
    try {
      const submission = localDb
        .prepare(
          "SELECT submission_id AS submissionId, pdf_path AS pdfPath FROM submissions WHERE submission_id = ?"
        )
        .get(req.params.submissionId) as
        | { submissionId: string; pdfPath: string | null }
        | undefined;
      if (!submission?.pdfPath) {
        return res.status(404).json({ error: "Report not found" });
      }

      if (fs.existsSync(submission.pdfPath)) {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=GreenPack_Report_${submission.submissionId}.pdf`
        );
        fs.createReadStream(submission.pdfPath).pipe(res);
      } else {
        res.status(404).json({ error: "PDF file missing on server" });
      }
    } catch (err) {
      res.status(500).json({ error: "Internal server error" });
    }
  });
};
