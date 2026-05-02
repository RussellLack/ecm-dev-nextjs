import { NextRequest, NextResponse } from "next/server";
import { getToolSubmission, getSubmission, getMaturityBands } from "@/lib/assessment/queries";
import type {
  CmsImplementationInputs,
  CmsImplementationResult,
} from "@/lib/assessment/cms-implementation/types";

/**
 * Minimal PDF generator — zero external dependencies.
 * Produces a simple but clean text-based PDF using raw PDF syntax.
 */

class SimplePdf {
  private objects: string[] = [];
  private pages: number[] = [];
  private currentPageContent: string[] = [];
  private y = 780; // Start near top (A4 = 595 x 842 points)
  private readonly PAGE_W = 595;
  private readonly MARGIN_L = 50;
  private readonly MARGIN_R = 50;
  private readonly LINE_H = 14;

  // Colours (RGB 0-1)
  private readonly WHITE = "1 1 1";
  private readonly GRAY = "0.61 0.64 0.68";
  private readonly LIME = "0.667 0.973 0.439";
  private readonly RED = "0.973 0.443 0.443";
  private readonly YELLOW = "0.984 0.749 0.141";
  private readonly ORANGE = "0.984 0.573 0.235";
  private readonly EMERALD = "0.204 0.827 0.525";
  private readonly BG = "0.043 0.122 0.055";

  private escapeText(text: string): string {
    return text
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)")
      .replace(/[^\x20-\x7E]/g, " "); // Strip non-ASCII for safety
  }

  private truncate(text: string, maxChars: number = 80): string {
    if (text.length <= maxChars) return text;
    return text.slice(0, maxChars - 3) + "...";
  }

  private checkPage() {
    if (this.y < 60) {
      this.finishPage();
      this.startPage();
    }
  }

  startPage() {
    this.y = 780;
    this.currentPageContent = [];
    // Dark background
    this.currentPageContent.push(
      `${this.BG} rg`,
      `0 0 ${this.PAGE_W} 842 re f`
    );
  }

  finishPage() {
    const contentStr = this.currentPageContent.join("\n");
    // Stream object
    const streamObj = this.addObject(
      `<< /Length ${contentStr.length} >>\nstream\n${contentStr}\nendstream`
    );
    // Page object
    const pageObj = this.addObject(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents ${streamObj} 0 R /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> >>`
    );
    this.pages.push(pageObj);
  }

  private addObject(content: string): number {
    this.objects.push(content);
    return this.objects.length; // 1-based object number (offset by reserved slots)
  }

  brand(text: string) {
    this.currentPageContent.push(
      `BT`,
      `/F2 7 Tf`,
      `${this.LIME} rg`,
      `${this.MARGIN_L} ${this.y} Td`,
      `(${this.escapeText(text.toUpperCase())}) Tj`,
      `ET`
    );
    this.y -= 18;
  }

  title(text: string) {
    this.currentPageContent.push(
      `BT`,
      `/F2 20 Tf`,
      `${this.WHITE} rg`,
      `${this.MARGIN_L} ${this.y} Td`,
      `(${this.escapeText(text)}) Tj`,
      `ET`
    );
    this.y -= 24;
  }

  subtitle(text: string) {
    this.currentPageContent.push(
      `BT`,
      `/F1 9 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L} ${this.y} Td`,
      `(${this.escapeText(text)}) Tj`,
      `ET`
    );
    this.y -= 14;
  }

  divider() {
    this.currentPageContent.push(
      `0.2 0.2 0.2 RG`,
      `0.5 w`,
      `${this.MARGIN_L} ${this.y} m ${this.PAGE_W - this.MARGIN_R} ${this.y} l S`
    );
    this.y -= 12;
  }

  sectionTitle(text: string) {
    this.checkPage();
    this.y -= 6;
    this.currentPageContent.push(
      `BT`,
      `/F2 7 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L} ${this.y} Td`,
      `(${this.escapeText(text.toUpperCase())}) Tj`,
      `ET`
    );
    this.y -= 14;
  }

  row(label: string, value: string) {
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F1 9 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${this.escapeText(label)}) Tj`,
      `ET`,
      `BT`,
      `/F1 9 Tf`,
      `${this.WHITE} rg`,
      `${this.MARGIN_L + 120} ${this.y} Td`,
      `(${this.escapeText(this.truncate(value))}) Tj`,
      `ET`
    );
    this.y -= this.LINE_H;
  }

  bigStat(value: string, label: string, color: string) {
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F2 18 Tf`,
      `${color} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${this.escapeText(value)}) Tj`,
      `ET`
    );
    this.y -= 8;
    this.currentPageContent.push(
      `BT`,
      `/F1 7 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${this.escapeText(label)}) Tj`,
      `ET`
    );
    this.y -= 16;
  }

  text(content: string, color = this.WHITE, fontSize = 9, bold = false) {
    this.checkPage();
    const font = bold ? "/F2" : "/F1";
    // Simple word wrap
    const maxWidth = this.PAGE_W - this.MARGIN_L - this.MARGIN_R - 8;
    const charsPerLine = Math.floor(maxWidth / (fontSize * 0.5));
    const words = content.split(" ");
    let line = "";

    for (const word of words) {
      if ((line + " " + word).trim().length > charsPerLine) {
        this.checkPage();
        this.currentPageContent.push(
          `BT`,
          `${font} ${fontSize} Tf`,
          `${color} rg`,
          `${this.MARGIN_L + 4} ${this.y} Td`,
          `(${this.escapeText(line.trim())}) Tj`,
          `ET`
        );
        this.y -= fontSize * 1.4;
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    }
    if (line.trim()) {
      this.checkPage();
      this.currentPageContent.push(
        `BT`,
        `${font} ${fontSize} Tf`,
        `${color} rg`,
        `${this.MARGIN_L + 4} ${this.y} Td`,
        `(${this.escapeText(line.trim())}) Tj`,
        `ET`
      );
      this.y -= fontSize * 1.4;
    }
  }

  bullet(content: string, bulletColor = this.LIME, textColor = this.WHITE) {
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F2 9 Tf`,
      `${bulletColor} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(-) Tj`,
      `ET`
    );
    // Wrap text
    const maxWidth = this.PAGE_W - this.MARGIN_L - this.MARGIN_R - 20;
    const charsPerLine = Math.floor(maxWidth / 4.5);
    const words = content.split(" ");
    let line = "";
    let firstLine = true;

    for (const word of words) {
      if ((line + " " + word).trim().length > charsPerLine) {
        this.checkPage();
        this.currentPageContent.push(
          `BT`,
          `/F1 9 Tf`,
          `${textColor} rg`,
          `${this.MARGIN_L + 16} ${this.y} Td`,
          `(${this.escapeText(line.trim())}) Tj`,
          `ET`
        );
        this.y -= 12;
        line = word;
        firstLine = false;
      } else {
        line = (line + " " + word).trim();
      }
    }
    if (line.trim()) {
      if (!firstLine) this.checkPage();
      this.currentPageContent.push(
        `BT`,
        `/F1 9 Tf`,
        `${textColor} rg`,
        `${this.MARGIN_L + 16} ${this.y} Td`,
        `(${this.escapeText(line.trim())}) Tj`,
        `ET`
      );
      this.y -= 12;
    }
    this.y -= 2;
  }

  numberedItem(num: number, content: string) {
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F2 9 Tf`,
      `${this.LIME} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${num}.) Tj`,
      `ET`
    );
    this.text(content, this.WHITE, 9);
  }

  flag(type: "critical" | "warning", msg: string) {
    const color = type === "critical" ? this.RED : this.YELLOW;
    const marker = type === "critical" ? "[!]" : "[*]";
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F2 8 Tf`,
      `${color} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${marker}) Tj`,
      `ET`
    );
    // Offset text after marker
    const maxWidth = this.PAGE_W - this.MARGIN_L - this.MARGIN_R - 28;
    const charsPerLine = Math.floor(maxWidth / 4);
    const words = msg.split(" ");
    let line = "";

    for (const word of words) {
      if ((line + " " + word).trim().length > charsPerLine) {
        this.checkPage();
        this.currentPageContent.push(
          `BT`,
          `/F1 8 Tf`,
          `${color} rg`,
          `${this.MARGIN_L + 22} ${this.y} Td`,
          `(${this.escapeText(line.trim())}) Tj`,
          `ET`
        );
        this.y -= 11;
        line = word;
      } else {
        line = (line + " " + word).trim();
      }
    }
    if (line.trim()) {
      this.currentPageContent.push(
        `BT`,
        `/F1 8 Tf`,
        `${color} rg`,
        `${this.MARGIN_L + 22} ${this.y} Td`,
        `(${this.escapeText(line.trim())}) Tj`,
        `ET`
      );
      this.y -= 11;
    }
    this.y -= 2;
  }

  capabilityBar(label: string, value: number) {
    this.checkPage();
    this.currentPageContent.push(
      `BT`,
      `/F1 8 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L + 4} ${this.y} Td`,
      `(${this.escapeText(label)}) Tj`,
      `ET`
    );
    // Draw 5 boxes
    for (let i = 0; i < 5; i++) {
      const x = this.MARGIN_L + 160 + i * 12;
      if (i < value) {
        this.currentPageContent.push(`${this.LIME} rg`);
      } else {
        this.currentPageContent.push(`0.16 0.24 0.17 rg`);
      }
      this.currentPageContent.push(
        `${x} ${this.y - 3} 8 8 re f`
      );
    }
    this.currentPageContent.push(
      `BT`,
      `/F1 7 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L + 225} ${this.y} Td`,
      `(${value}/5) Tj`,
      `ET`
    );
    this.y -= 14;
  }

  space(pts: number = 8) {
    this.y -= pts;
  }

  footer() {
    this.currentPageContent.push(
      `BT`,
      `/F1 6 Tf`,
      `${this.GRAY} rg`,
      `${this.MARGIN_L} 25 Td`,
      `(ECM.DEV  --  Content Operations Intelligence  --  ecm.dev/assessments) Tj`,
      `ET`
    );
  }

  getColorString(colorHint: string): string {
    if (colorHint?.includes("emerald") || colorHint?.includes("green")) return this.EMERALD;
    if (colorHint?.includes("yellow")) return this.YELLOW;
    if (colorHint?.includes("orange")) return this.ORANGE;
    if (colorHint?.includes("red")) return this.RED;
    if (colorHint?.includes("blue")) return "0.376 0.647 0.98";
    return this.GRAY;
  }

  build(): Buffer {
    // Finish last page
    this.footer();
    this.finishPage();

    // Build PDF structure
    // Reserved objects: 1=Catalog, 2=Pages, 3=Font1(Helvetica), 4=Font2(Helvetica-Bold)
    const reservedCount = 4;
    const allObjects: string[] = [
      `<< /Type /Catalog /Pages 2 0 R >>`, // obj 1
      `<< /Type /Pages /Kids [${this.pages.map(p => `${p + reservedCount} 0 R`).join(" ")}] /Count ${this.pages.length} >>`, // obj 2
      `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`, // obj 3
      `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`, // obj 4
      ...this.objects, // user objects start at 5
    ];

    // Generate cross-reference table
    let body = "";
    const offsets: number[] = [];
    const header = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
    body = header;

    for (let i = 0; i < allObjects.length; i++) {
      offsets.push(body.length);
      body += `${i + 1} 0 obj\n${allObjects[i]}\nendobj\n`;
    }

    const xrefOffset = body.length;
    let xref = `xref\n0 ${allObjects.length + 1}\n`;
    xref += `0000000000 65535 f \n`;
    for (const offset of offsets) {
      xref += `${String(offset).padStart(10, "0")} 00000 n \n`;
    }

    const trailer = `trailer\n<< /Size ${allObjects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

    const pdfString = body + xref + trailer;
    return Buffer.from(pdfString, "binary");
  }
}

/* ─── Build Process PDF ─── */

function buildProcessPdf(results: any, name: string, role: string, company: string, date: string): Buffer {
  const pdf = new SimplePdf();
  pdf.startPage();

  pdf.brand("ECM.DEV -- Pre-Diagnostic Brief");
  pdf.title("Process Assessment");
  pdf.subtitle(
    [name || "Anonymous", role, company].filter(Boolean).join(" | ") +
    (date ? ` | ${date}` : "")
  );
  pdf.divider();

  const ratingColor = pdf.getColorString(results.ratingColor);
  pdf.bigStat(results.ratingLabel || "--", "Process State", ratingColor);

  const impactColor = pdf.getColorString(results.impactColor);
  pdf.bigStat(results.impactLabel || "--", "Impact Level", impactColor);
  pdf.space(4);

  pdf.sectionTitle("Process Overview");
  pdf.row("Domain:", results.domain || "--");
  pdf.row("Type:", `${results.processType || "--"}`);
  pdf.row("Frequency:", results.frequency || "--");
  pdf.row("People:", results.people || "--");
  pdf.row("Duration:", results.duration || "--");
  pdf.space(6);

  pdf.sectionTitle("Ownership & Decisions");
  pdf.row("Owner:", results.processOwner || "--");
  pdf.row("Approvals:", results.approvalStyle || "--");
  pdf.row("Exceptions:", results.exceptions || "--");
  pdf.row("SOPs:", results.sops || "--");
  pdf.space(6);

  if (results.timeLost?.length > 0) {
    pdf.sectionTitle("Where Time Gets Lost");
    for (const item of results.timeLost) {
      pdf.bullet(item);
    }
    pdf.space(4);
  }

  if (results.painPoints?.length > 0) {
    pdf.sectionTitle("Pain Points Identified");
    for (const item of results.painPoints) {
      pdf.bullet(item);
    }
    if (results.notes) {
      pdf.space(2);
      pdf.text(`"${results.notes}"`, pdf.getColorString("gray"), 8);
    }
    pdf.space(4);
  }

  pdf.sectionTitle("Readiness Signals");
  pdf.row("Automation:", results.automationDiscussed || "--");
  pdf.row("Documentation:", (results.sops || "").split("--")[0]?.trim() || "--");
  pdf.row("Change appetite:", results.changeAppetite || "--");
  pdf.space(6);

  if (results.flags?.length > 0) {
    pdf.sectionTitle("Consultant Flags");
    for (const f of results.flags) {
      pdf.flag(f.type, f.msg);
    }
    pdf.space(4);
  }

  if (results.topics?.length > 0) {
    pdf.sectionTitle("Suggested Discussion Topics");
    results.topics.forEach((topic: string, i: number) => {
      pdf.numberedItem(i + 1, topic);
    });
  }

  return pdf.build();
}

/* ─── Build Lead Magnet PDF ─── */

function buildLeadMagnetPdf(results: any, name: string, company: string, date: string): Buffer {
  const pdf = new SimplePdf();
  pdf.startPage();

  pdf.brand("ECM.DEV -- Lead Magnet Analysis");
  pdf.title("Lead Magnet Ideation Results");
  pdf.subtitle(
    [name || "Anonymous", company].filter(Boolean).join(" | ") +
    (date ? ` | ${date}` : "")
  );
  pdf.divider();

  const readinessColor = results.readiness >= 75
    ? pdf.getColorString("emerald")
    : results.readiness >= 50
      ? pdf.getColorString("yellow")
      : pdf.getColorString("orange");

  pdf.bigStat(`${results.readiness}%`, "Readiness Score", readinessColor);
  pdf.text(results.readinessLabel || "", readinessColor, 9, true);
  pdf.space(8);

  pdf.sectionTitle("Top 3 Lead Magnet Formats");
  results.topThree?.forEach((f: any, i: number) => {
    pdf.text(`${i + 1}. ${f.name}`, pdf.getColorString(""), 12, true);
    pdf.text(f.description, pdf.getColorString("gray"), 9);
    pdf.text(`Effort: ${f.effort}  |  Timeline: ${f.timeToCreate}`, pdf.getColorString("gray"), 8);
    pdf.text(f.topicTemplate || "", pdf.getColorString("emerald"), 8);
    if (f.gaps?.length > 0) {
      const gapStr = "Gaps: " + f.gaps.map((g: any) => `${g.dimension} (${g.current} > ${g.required})`).join(", ");
      pdf.text(gapStr, pdf.getColorString("gray"), 7);
    }
    pdf.space(8);
  });

  if (results.capabilityDimensions?.length > 0) {
    pdf.sectionTitle("Capability Profile");
    for (const dim of results.capabilityDimensions) {
      pdf.capabilityBar(dim.label, results.capabilities?.[dim.id] || 1);
    }
    pdf.space(6);
  }

  if (results.biggestGap) {
    pdf.sectionTitle("Priority Gap to Close");
    pdf.text(results.biggestGap.dimension, pdf.getColorString("yellow"), 12, true);
    pdf.text(
      `Current: ${results.biggestGap.current}/5  |  Required: ${results.biggestGap.required}/5`,
      pdf.getColorString("gray"),
      9
    );
    pdf.space(4);
    if (results.gapActions?.length > 0) {
      for (const action of results.gapActions) {
        pdf.bullet(action, pdf.getColorString("yellow"));
      }
    }
  }

  return pdf.build();
}

/* ─── Build Content Maturity PDF ─── */

function buildMaturityPdf(submission: any, band: any): Buffer {
  const pdf = new SimplePdf();
  pdf.startPage();

  pdf.brand("ECM.DEV -- Content Maturity Assessment");
  pdf.title("Your Maturity Results");
  pdf.subtitle(
    [submission.firstName || "Anonymous", submission.company].filter(Boolean).join(" | ")
  );
  pdf.divider();

  const hexToColorStr = (hex: string): string => {
    if (!hex || !hex.startsWith("#")) return pdf.getColorString("gray");
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return `${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)}`;
  };

  const bandColor = hexToColorStr(band?.color || "#6B7280");

  pdf.bigStat(`${submission.totalScore || 0}%`, "Total Score", bandColor);
  pdf.bigStat(band?.title || submission.bandTitle || "--", "Maturity Band", bandColor);

  if (band?.headline) {
    pdf.space(4);
    pdf.text(band.headline, pdf.getColorString(""), 11, true);
    if (band.description) {
      pdf.space(2);
      pdf.text(band.description, pdf.getColorString("gray"), 9);
    }
    pdf.space(6);
  }

  if (submission.dimensionScores?.length > 0) {
    pdf.sectionTitle("Dimension Scores");
    for (const dim of submission.dimensionScores) {
      pdf.row(dim.dimensionTitle, `${dim.score}/${dim.maxScore}`);
    }
    pdf.space(6);
  }

  if (submission.weakAreas?.length > 0) {
    pdf.sectionTitle("Areas for Improvement");
    for (const area of submission.weakAreas) {
      const dim = submission.dimensionScores?.find(
        (d: any) => d.dimensionKey === area
      );
      pdf.bullet(dim?.dimensionTitle || area);
    }
  }

  return pdf.build();
}

/* ─── Build CMS Implementation PDF ─── */

function fmtCurrency(value: number, sym: string): string {
  if (value === 0) return `${sym}0`;
  if (Math.abs(value) >= 1_000_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.abs(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value) / 1_000)}k`;
  }
  return `${value < 0 ? "-" : ""}${sym}${Math.round(Math.abs(value))}`;
}

function currencySymbol(c: "USD" | "GBP" | "EUR"): string {
  return c === "USD" ? "$" : c === "GBP" ? "£" : "EUR ";
}

function confidenceLabel(c: "A" | "B" | "C"): string {
  return c === "A" ? "High confidence" : c === "B" ? "Medium confidence" : "Indicative only";
}

function buildCmsImplementationPdf(
  inputs: CmsImplementationInputs,
  result: CmsImplementationResult,
  name: string,
  company: string,
  role: string,
  date: string,
): Buffer {
  const pdf = new SimplePdf();
  const m = result.currencyMultiplier;
  const sym = currencySymbol(result.currency);
  const horizon = inputs.runtime.horizon;
  const total =
    horizon === 5 ? result.fiveYearTotal : result.threeYearTotal;
  const benefit = inputs.options?.useTeiBenefit
    ? result.benefit.tei
    : result.benefit.conservative;
  const benefitTotal =
    horizon === 5 ? benefit.fiveYearValue : benefit.threeYearValue;

  pdf.startPage();

  pdf.brand(`ECM.DEV -- CMS Implementation TCO`);
  pdf.title(`${horizon}-Year TCO Estimate`);
  pdf.subtitle(
    [name || "Anonymous", role, company].filter(Boolean).join(" | ") +
      (date ? ` | ${date}` : ""),
  );
  pdf.divider();

  /* Headline TCO */
  const tcoBand = `${fmtCurrency(total.low * m, sym)} - ${fmtCurrency(total.high * m, sym)}`;
  pdf.bigStat(tcoBand, `Indicative ${horizon}-year TCO`, pdf.getColorString("emerald"));
  pdf.text(
    `Mid case ${fmtCurrency(total.mid * m, sym)} | ${confidenceLabel(result.flags.confidence)}`,
    pdf.getColorString("gray"),
    9,
  );
  pdf.space(4);

  const netLow = (total.low - benefitTotal.high) * m;
  const netHigh = (total.high - benefitTotal.low) * m;
  const netMid = (total.mid - benefitTotal.mid) * m;
  pdf.bigStat(
    `${fmtCurrency(netLow, sym)} - ${fmtCurrency(netHigh, sym)}`,
    `Net of benefit (${horizon}-yr)`,
    pdf.getColorString("emerald"),
  );
  pdf.text(
    `Mid ${fmtCurrency(netMid, sym)} after editor + dev productivity savings`,
    pdf.getColorString("gray"),
    9,
  );
  pdf.space(6);

  /* Scenario summary */
  pdf.sectionTitle("Scenario");
  pdf.row("Org size:", inputs.org.size);
  pdf.row("Region:", inputs.org.region);
  pdf.row("Currency:", inputs.org.currency);
  pdf.row("Current platform:", inputs.current.platform);
  pdf.row(
    "Years on platform:",
    inputs.current.yearsOnPlatform,
  );
  pdf.row("Target tier:", inputs.target.tier);
  pdf.row("Specific vendor:", inputs.target.vendor || "Don't know yet");
  pdf.row("Deployment:", inputs.target.deployment);
  pdf.row(
    "Sites / locales:",
    `${inputs.scope.sites} / ${inputs.scope.locales}`,
  );
  pdf.row("Page bucket:", inputs.scope.pageBucket);
  pdf.row(
    "Integrations:",
    inputs.scope.integrations.length > 0
      ? inputs.scope.integrations.join(", ")
      : "None",
  );
  pdf.row("Personalisation:", inputs.scope.personalisation);
  pdf.row(
    "Compliance:",
    inputs.scope.compliance.length > 0
      ? inputs.scope.compliance.join(", ")
      : "None",
  );
  pdf.row("Editors:", String(inputs.runtime.editors));
  pdf.row("Updates / week:", inputs.runtime.updateFreq);
  pdf.row("Internal team:", inputs.runtime.teamSize);
  pdf.space(6);

  /* Cost breakdown */
  pdf.sectionTitle("Cost breakdown");
  const lines: { label: string; cadence: string; r: { low: number; mid: number; high: number } }[] = [
    { label: "Year 1 implementation", cadence: "One-off", r: result.breakdown.implementation },
    { label: "+ Contingency", cadence: "One-off", r: result.breakdown.contingency },
    { label: "Annual licence", cadence: "Annual", r: result.breakdown.licence },
    { label: "Annual hosting + run team", cadence: "Annual", r: result.breakdown.hosting },
    { label: "Annual vendor support", cadence: "Annual", r: result.breakdown.vendorSupport },
    { label: "Out-year enhancement", cadence: "Annual Y2+", r: result.breakdown.outYearEnhancement },
  ];
  for (const line of lines) {
    pdf.row(
      `${line.label} (${line.cadence}):`,
      `${fmtCurrency(line.r.low * m, sym)} - ${fmtCurrency(line.r.high * m, sym)}`,
    );
  }
  pdf.space(6);

  /* Year-by-year totals */
  pdf.sectionTitle(`${horizon}-year cash flow`);
  for (const year of result.totalsByYear) {
    pdf.row(
      `Year ${year.year}:`,
      `${fmtCurrency(year.low * m, sym)} - ${fmtCurrency(year.high * m, sym)}`,
    );
  }
  pdf.space(6);

  /* Benefit side */
  pdf.sectionTitle(
    `Benefit side (${inputs.options?.useTeiBenefit ? "vendor-cited TEI" : "conservative"})`,
  );
  pdf.row(
    `${horizon}-year value:`,
    `${fmtCurrency(benefitTotal.low * m, sym)} - ${fmtCurrency(benefitTotal.high * m, sym)}`,
  );
  pdf.row(
    "Editor hours saved / yr:",
    Math.round(benefit.editorHoursSaved).toLocaleString("en-GB"),
  );
  pdf.row(
    "Dev hours saved / yr:",
    Math.round(benefit.devHoursSaved).toLocaleString("en-GB"),
  );
  if (benefit.revenueUplift > 0) {
    pdf.row(
      "Revenue uplift / yr:",
      fmtCurrency(benefit.revenueUplift * m, sym),
    );
  }
  pdf.space(6);

  /* Notes */
  if (result.flags.notes.length > 0) {
    pdf.sectionTitle("Notes");
    for (const note of result.flags.notes) {
      pdf.bullet(note);
    }
    pdf.space(4);
  }

  /* Risk flags */
  if (result.flags.salesGated) {
    pdf.flag(
      "warning",
      "Sales-gated vendor selected. Analyst-broker estimates can diverge plus or minus 40% from negotiated price. Book a 30-min benchmarking call to tighten the range.",
    );
  }
  if (result.flags.highRiskProfile) {
    pdf.flag(
      "critical",
      "High-risk profile detected. Two or more of: locales >= 6, integrations >= 5, heavy AI personalisation, >= 3 compliance constraints, or 50,000+ pages. The high band has been widened to 1.8x mid (vs 1.4x baseline) -- these scenarios historically overrun 200%+.",
    );
  }
  pdf.space(4);

  /* Methodology footer */
  pdf.sectionTitle("Methodology");
  pdf.text(
    `Coefficients are anchored in USD with display conversion (GBP x 0.79, EUR x 0.92). Sources include vendor pricing pages, Forrester TEI studies (Contentstack 295% ROI, Kontent.ai 320%, Storyblok 582%), Real Story Group, ContractorUK, McKinsey IT-overrun research. Refreshed quarterly. Model version ${result.modelVersion}.`,
    pdf.getColorString("gray"),
    8,
  );
  pdf.space(2);
  pdf.text(
    "Full coefficient table and confidence ratings: ecm.dev/assessment/cms-implementation/methodology",
    pdf.getColorString("emerald"),
    8,
  );

  return pdf.build();
}

/* ─── Route handler ─── */

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sid = searchParams.get("sid");
  const type = searchParams.get("type");

  if (!sid) {
    return NextResponse.json({ error: "Missing sid parameter" }, { status: 400 });
  }

  try {
    let pdfBuffer: Buffer;
    let filename: string;

    if (type === "process" || type === "lead-magnet" || type === "cms-implementation") {
      const submission = await getToolSubmission(sid);
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const results =
        typeof submission.results === "string"
          ? JSON.parse(submission.results)
          : submission.results;

      const date = submission.submittedAt
        ? new Date(submission.submittedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        : "";

      if (type === "process") {
        pdfBuffer = buildProcessPdf(
          results,
          submission.name || "",
          submission.role || "",
          submission.company || "",
          date
        );
        filename = `ECM-Process-Assessment-${date || sid.slice(0, 8)}.pdf`;
      } else if (type === "lead-magnet") {
        pdfBuffer = buildLeadMagnetPdf(
          results,
          submission.name || "",
          submission.company || "",
          date
        );
        filename = `ECM-Lead-Magnet-Analysis-${date || sid.slice(0, 8)}.pdf`;
      } else {
        // cms-implementation
        if (submission.toolType !== "cms-implementation") {
          return NextResponse.json({ error: "Submission type mismatch" }, { status: 400 });
        }
        const inputs =
          typeof submission.answers === "string"
            ? (JSON.parse(submission.answers) as CmsImplementationInputs)
            : (submission.answers as unknown as CmsImplementationInputs);
        const result = results as CmsImplementationResult;
        pdfBuffer = buildCmsImplementationPdf(
          inputs,
          result,
          submission.name || "",
          submission.company || "",
          submission.role || "",
          date,
        );
        filename = `ECM-CMS-Implementation-TCO-${date || sid.slice(0, 8)}.pdf`;
      }
    } else {
      const submission = await getSubmission(sid);
      if (!submission) {
        return NextResponse.json({ error: "Submission not found" }, { status: 404 });
      }

      const bands = await getMaturityBands(submission.assessment._id).catch(() => []);
      const band =
        bands.find(
          (b: any) =>
            submission.totalScore >= b.minScore && submission.totalScore <= b.maxScore
        ) || bands[0];

      pdfBuffer = buildMaturityPdf(submission, band);
      filename = `ECM-Maturity-Assessment-${submission.firstName || sid.slice(0, 8)}.pdf`;
    }

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
