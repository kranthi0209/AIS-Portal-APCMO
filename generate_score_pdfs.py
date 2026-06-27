# -*- coding: utf-8 -*-
"""
Generates ONE very-detailed, self-contained PDF per score for the
AP IAS Performance Tracking System.   Run:  py generate_score_pdfs.py
All on-page text is high contrast (dark ink on white, bright text on navy).
"""
import warnings
warnings.filterwarnings("ignore")
from fpdf import FPDF
from fpdf.enums import XPos, YPos

NAVY   = (26, 24, 64)
GOLD   = (245, 158, 11)
GOLDBR = (253, 224, 71)
BROWN  = (124, 45, 18)
INK    = (33, 27, 22)
GREY   = (95, 82, 72)
CREAM2 = (255, 246, 234)
BLUEBG = (235, 242, 252)
LINE   = (224, 176, 120)
GREEN  = (18, 110, 53)
COVERSUB = (220, 226, 238)
COVERCHIP= (200, 208, 226)

PAGE_W = 210
MARGIN = 16
USABLE = PAGE_W - 2 * MARGIN


def t(s):
    rep = {"→":"->","←":"<-","⇒":"=>","≤":"<=","≥":">=","≠":"!=","≈":"~",
           "×":"x","÷":"/","₹":"Rs.","∑":"SUM","√":"sqrt","•":"-","–":"-",
           "—":"--","‘":"'","’":"'","“":'"',"”":'"',"²":"^2","³":"^3",
           "½":"1/2","°":"deg","…":"...","▸":">","✅":"[OK]","⚠":"[!]","≅":"~"}
    for k, v in rep.items():
        s = s.replace(k, v)
    return s


def darker(c, f=0.78):
    return tuple(int(x * f) for x in c)


class PDF(FPDF):
    accent = (124, 45, 18)
    accent_h3 = (124, 45, 18)
    score_name = ""

    def header(self):
        if self.page_no() == 1:
            return
        self.set_xy(MARGIN, 7)
        self.set_font("Helvetica", "B", 8); self.set_text_color(*self.accent_h3)
        self.cell(80, 5, t(self.score_name), 0, 0, "L")
        self.set_x(PAGE_W - MARGIN - 98); self.set_text_color(*GREY)
        self.cell(98, 5, t("AP IAS Performance Tracking System  -  CMO, Govt. of A.P."), 0, 0, "R")
        self.set_draw_color(*self.accent); self.set_line_width(0.4)
        self.line(MARGIN, 13.2, PAGE_W - MARGIN, 13.2)
        self.set_y(17.5)

    def footer(self):
        if self.page_no() == 1:
            return
        self.set_y(-12); self.set_draw_color(*LINE); self.set_line_width(0.2)
        self.line(MARGIN, self.get_y(), PAGE_W - MARGIN, self.get_y())
        self.set_y(-10); self.set_font("Helvetica", "", 7.5); self.set_text_color(*GREY)
        self.cell(90, 5, t("Confidential - for official use"), 0, 0, "L")
        self.set_x(PAGE_W - MARGIN - 60)
        self.cell(60, 5, t("Page %d" % self.page_no()), 0, 0, "R")

    def h1(self, num, title):
        if self.get_y() > 230:
            self.add_page()
        self.ln(3)
        y = self.get_y()
        self.set_fill_color(*self.accent)
        self.rect(MARGIN, y, 9, 9, "F")
        self.set_xy(MARGIN, y)
        self.set_font("Helvetica", "B", 11); self.set_text_color(255, 255, 255)
        self.cell(9, 9, t(str(num)), 0, 0, "C")
        self.set_xy(MARGIN + 12.5, y)
        self.set_font("Helvetica", "B", 14.5); self.set_text_color(*self.accent_h3)
        self.cell(0, 9, t(title), 0, 0, "L")
        self.set_draw_color(*self.accent); self.set_line_width(0.6)
        self.line(MARGIN, y + 10.6, PAGE_W - MARGIN, y + 10.6)
        self.set_xy(MARGIN, y + 13); self.ln(2)

    def h2(self, title):
        if self.get_y() > 254:
            self.add_page()
        self.ln(1.6)
        self.set_font("Helvetica", "B", 11); self.set_text_color(*BROWN)
        self.cell(0, 7, t(title), 0, 1, "L")
        self.set_draw_color(*GOLD); self.set_line_width(0.4)
        self.line(MARGIN, self.get_y(), MARGIN + 58, self.get_y())
        self.ln(2.6)

    def h3(self, title):
        if self.get_y() > 262:
            self.add_page()
        self.ln(0.6)
        self.set_font("Helvetica", "B", 9.8); self.set_text_color(*self.accent_h3)
        self.cell(0, 5.6, t(title), 0, 1, "L")

    def body(self, text, size=9.4, gap=4.85):
        self.set_x(MARGIN)
        self.set_font("Helvetica", "", size); self.set_text_color(*INK)
        self.multi_cell(USABLE, gap, t(text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1)

    def bullets(self, items, size=9.4):
        for it in items:
            if self.get_y() > 268:
                self.add_page()
            y0 = self.get_y()
            self.set_xy(MARGIN, y0)
            self.set_font("Helvetica", "B", size); self.set_text_color(*self.accent_h3)
            self.cell(5, 4.7, t("-"), new_x=XPos.LEFT, new_y=YPos.TOP)
            self.set_xy(MARGIN + 5, y0)
            self.set_font("Helvetica", "", size); self.set_text_color(*INK)
            self.multi_cell(USABLE - 5, 4.7, t(it), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        self.ln(1)

    def kv(self, pairs, kw=48):
        for k, v in pairs:
            if self.get_y() > 266:
                self.add_page()
            yk = self.get_y()
            self.set_xy(MARGIN, yk)
            self.set_font("Helvetica", "B", 8.8); self.set_text_color(*BROWN)
            self.multi_cell(kw, 4.7, t(k), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            yend = self.get_y()
            self.set_xy(MARGIN + kw, yk)
            self.set_font("Helvetica", "", 8.8); self.set_text_color(*INK)
            self.multi_cell(USABLE - kw, 4.7, t(v), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_y(max(yend, self.get_y()))
        self.ln(1.5)

    def formula(self, lines, label="FORMULA"):
        self.ln(1); h = 5.2; total = h * len(lines) + 7.5
        if self.get_y() + total > 280:
            self.add_page()
        y = self.get_y()
        self.set_fill_color(247, 250, 255); self.set_draw_color(58, 92, 162); self.set_line_width(0.4)
        self.rect(MARGIN, y, USABLE, total, "DF")
        self.set_xy(MARGIN + 3, y + 2)
        self.set_font("Helvetica", "B", 7.5); self.set_text_color(34, 64, 140)
        self.cell(0, 4, t(label), 0, 1)
        self.set_font("Courier", "", 8.9); self.set_text_color(16, 26, 56)
        for ln_ in lines:
            self.set_x(MARGIN + 4)
            self.multi_cell(USABLE - 7, h, t(ln_))
        self.set_y(y + total); self.ln(2)

    def example(self, title, lines):
        self.ln(1); body_h = 4.5; total = 7.5 + body_h * len(lines) + 2
        if self.get_y() + total > 280:
            self.add_page()
        y = self.get_y()
        self.set_fill_color(255, 253, 248); self.set_draw_color(*GOLD); self.set_line_width(0.5)
        self.rect(MARGIN, y, USABLE, total, "DF")
        self.set_xy(MARGIN + 3, y + 2)
        self.set_font("Helvetica", "B", 8.6); self.set_text_color(*BROWN)
        self.cell(0, 4.5, t("WORKED EXAMPLE - " + title), 0, 1)
        self.set_font("Helvetica", "", 8.7); self.set_text_color(*INK)
        for ln_ in lines:
            self.set_x(MARGIN + 4)
            self.multi_cell(USABLE - 8, body_h, t(ln_))
        self.set_y(y + total); self.ln(2)

    def keynote(self, text):
        self.ln(1); self.set_font("Helvetica", "I", 9); self.set_text_color(*GREEN)
        y = self.get_y(); self.set_xy(MARGIN + 5, y + 2)
        self.multi_cell(USABLE - 9, 4.7, t("In plain words:  " + text), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        bottom = self.get_y() + 2
        self.set_draw_color(*GREEN); self.set_line_width(1.0)
        self.line(MARGIN + 2, y + 1, MARGIN + 2, bottom - 1)
        self.ln(1.6)

    def faq(self, qa):
        for q, a in qa:
            if self.get_y() > 260:
                self.add_page()
            self.set_x(MARGIN)
            self.set_font("Helvetica", "B", 9.2); self.set_text_color(*darker(self.accent, 0.9))
            self.multi_cell(USABLE, 4.8, t("Q.  " + q), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.set_x(MARGIN + 4)
            self.set_font("Helvetica", "", 9.2); self.set_text_color(*INK)
            self.multi_cell(USABLE - 4, 4.7, t("A.  " + a), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
            self.ln(1.4)

    def cover(self, accent, eyebrow, title_lines, subtitle, chips):
        self.add_page()
        # white page; thin accent + gold rules top & bottom (borders only)
        self.set_draw_color(*accent); self.set_line_width(1.4)
        self.line(MARGIN, 18, PAGE_W - MARGIN, 18)
        self.set_draw_color(*GOLD); self.set_line_width(0.5)
        self.line(MARGIN, 19.7, PAGE_W - MARGIN, 19.7)
        self.set_xy(0, 33)
        self.set_font("Helvetica", "B", 13); self.set_text_color(*darker(accent, 0.85))
        self.cell(0, 7, t("GOVERNMENT OF ANDHRA PRADESH"), 0, 1, "C")
        self.set_font("Helvetica", "", 10.5); self.set_text_color(*GREY)
        self.cell(0, 6, t("Chief Minister's Office  -  AP IAS Performance Tracking System"), 0, 1, "C")
        self.ln(24)
        self.set_font("Helvetica", "B", 11); self.set_text_color(*accent)
        self.cell(0, 7, t(eyebrow), 0, 1, "C")
        self.ln(5)
        self.set_font("Helvetica", "B", 30); self.set_text_color(*NAVY)
        for tl in title_lines:
            self.cell(0, 15, t(tl), 0, 1, "C")
        self.ln(9)
        self.set_draw_color(*GOLD); self.set_line_width(0.9)
        self.line(56, self.get_y(), PAGE_W - 56, self.get_y())
        self.ln(13)
        self.set_font("Helvetica", "", 11.5); self.set_text_color(50, 56, 74)
        self.set_x(26); self.multi_cell(PAGE_W - 52, 6.6, t(subtitle), 0, "C")
        self.ln(16)
        self.set_font("Helvetica", "B", 9.5); self.set_text_color(*GREY)
        self.set_x(24); self.multi_cell(PAGE_W - 48, 6, t(chips), 0, "C")
        # bottom rules
        self.set_draw_color(*GOLD); self.set_line_width(0.5)
        self.line(MARGIN, 277, PAGE_W - MARGIN, 277)
        self.set_draw_color(*accent); self.set_line_width(1.4)
        self.line(MARGIN, 278.7, PAGE_W - MARGIN, 278.7)
        self.set_xy(0, 282)
        self.set_font("Helvetica", "", 8.5); self.set_text_color(*GREY)
        self.cell(0, 5, t("A plain-language note - every formula matches the live calculation."), 0, 1, "C")


def new(accent, score_name):
    p = PDF("P", "mm", "A4")
    p.accent = accent
    p.accent_h3 = darker(accent, 0.92)
    p.score_name = score_name
    p.set_auto_page_break(True, 15)
    p.set_margins(MARGIN, 17.5, MARGIN)
    return p


def safe_output(p, name):
    """Write the PDF; if the target file is locked (open in a viewer / syncing),
    fall back to a *_NEW.pdf copy instead of crashing."""
    data = bytes(p.output())
    try:
        with open(name, "wb") as f:
            f.write(data)
    except PermissionError:
        alt = name.replace(".pdf", "_NEW.pdf")
        with open(alt, "wb") as f:
            f.write(data)
        print("  [!] '%s' is locked (open in a viewer?) - wrote '%s' instead." % (name, alt))


# ====================================================================
# Reusable foundation blocks
# ====================================================================
def found_posts(p, extra=True):
    p.h2("How an officer earns marks - the three kinds of post")
    p.body(
        "An IAS officer rarely stays in one chair for the whole report period. They move through "
        "several posts, one after another, and occasionally hold two responsibilities at the same time. "
        "Every post record in the system carries a tag called the OFFICE STATUS. This tag is the single "
        "most important switch in the whole calculation, because it decides WHICH piece of real-world "
        "data is credited to that post. There are exactly three kinds:")
    p.bullets([
        "DISTRICT post - the officer heads a district (e.g. District Collector & Magistrate). The post "
        "is matched to that DISTRICT's data. The match key is the post's 'office location' field, which "
        "holds the district name.",
        "SECRETARIAT post - the officer heads a department at the State Secretariat (e.g. Principal "
        "Secretary, Special Chief Secretary). The post is matched to that DEPARTMENT's data, using the "
        "post's 'department' field.",
        "HoD post - the officer is the Head of a Department or a field organisation (e.g. Commissioner, "
        "Director, Director-General). The post is matched to that HoD's data, using the post's 'HoD' "
        "field.",
    ])
    if extra:
        p.body(
            "A fourth possibility, 'Unmapped', occurs when a post has no usable office status (for "
            "example a training stint or a leave period). Unmapped posts carry no data and simply do "
            "not contribute to the score - they are neither rewarded nor penalised.")
    p.keynote(
        "the same officer can collect marks from a district while serving as Collector, from a "
        "department while serving as Secretary, and from a field office while serving as HoD. Each "
        "chair is judged only on the data belonging to that chair.")


def found_days(p):
    p.h2("Proportionate days - why a longer posting counts for more")
    p.body(
        "A post held for eleven months clearly deserves more weight than a post held for eleven days. "
        "If we treated every post equally, a one-week acting charge could swing an officer's whole "
        "score. To prevent this, each post is given a WEIGHT equal to the number of days it was held - "
        "its tenure days.")
    p.formula([
        "tenure days = (last day held) - (first day held) + 1",
        "",
        "If the post is still running, 'today' is used as the last day.",
        "A one-day charge therefore weighs 1; a full year weighs 365/366.",
    ], "PROPORTIONATE (TENURE) DAYS")
    p.body(
        "When several posts are combined into one number, each post's result is multiplied by its "
        "tenure days, the products are added, and the total is divided by the total days. This is the "
        "DAYS-WEIGHTED AVERAGE - the same arithmetic as a weighted average (below), with days playing "
        "the role of the weights.")
    p.formula([
        "                SUM ( post result x tenure days )",
        "officer value = -----------------------------------",
        "                       SUM ( tenure days )",
    ], "DAYS-WEIGHTED AVERAGE")
    p.h3("Counting each calendar day exactly once (overlap merge)")
    p.body(
        "Data-entry sometimes records the same posting in two over-lapping rows, or two genuine stints "
        "that touch each other (end on Monday, restart on Tuesday). If we simply added the day counts "
        "we would count some calendar days twice and inflate the weight unfairly. So before any "
        "counting, the date ranges of the SAME post are MERGED: over-lapping or back-to-back ranges are "
        "fused into one continuous range (a gap of one day or less is treated as continuous). A day on "
        "which the officer held the post therefore counts once - never twice, never zero.")


def found_normalise(p):
    p.h2("Putting different measures on one 0-100 ruler (normalisation)")
    p.body(
        "Different scores are measured in different units - rupees crore, minutes per file, survey "
        "points, percentages. You cannot fairly average rupees with minutes. So each measure is "
        "stretched onto a common 0-to-100 ruler using MIN-MAX normalisation:")
    p.formula([
        "normalised = (value - lowest) / (highest - lowest) x 100",
        "",
        "lowest  = the smallest value across all officers",
        "highest = the largest  value across all officers",
    ], "MIN-MAX NORMALISATION")
    p.body(
        "After the stretch, the best officer on that measure scores exactly 100, the weakest scores 0, "
        "and everyone else keeps their exact place in between. The only assumption is a straight-line "
        "stretch between the two ends, which is transparent and easy to audit. If every officer happens "
        "to be identical, the rule would divide by zero, so in that case all are simply set to 100.")


def found_difficulty(p, floor, load_desc, basis):
    p.h2("The difficulty (load) factor - rewarding a heavier burden")
    p.body(
        "Two officers may both be 90% efficient - but one cleared a tiny in-tray while the other ran a "
        "giant one; one managed a small grant while the other managed a huge one. Calling them equal "
        "would be unjust. So the efficiency is MULTIPLIED by a difficulty factor that grows with the "
        "size of the load the officer actually carried (" + load_desc + ").")
    p.formula([
        "difficulty = floor + (1 - floor) x W            (floor = %s)" % floor,
        "",
        "W = log(1 + load) placed on a 0..1 scale between the smallest",
        "    and the largest log-load across all officers.",
        "    W = 0 for the smallest load, W = 1 for the largest.",
        "",
        "load basis = " + basis,
    ], "DIFFICULTY / LOAD / VOLUME FACTOR")
    p.h3("Why a logarithm?")
    p.body(
        "A logarithm compresses big numbers so that equal MULTIPLES are equal steps. On a log scale the "
        "jump from 1 to 10 is the same size as 10 to 100, and 100 to 1000. We use it so that handling a "
        "much larger load is recognised as genuinely harder, WITHOUT letting a single enormous value "
        "swamp everyone else (which a plain, straight scale would allow).")
    p.keynote(
        "doing a small job perfectly can never out-rank doing a far bigger job equally well. The "
        "biggest load earns the full factor of 1.00; the smallest still keeps the floor (e.g. " + floor +
        "), so it is dampened but never reduced to zero.")


def found_weighted(p):
    p.h2("The weighted average - letting important pieces count more")
    p.body(
        "Most scores blend several pieces of evidence. A weighted average lets the more important "
        "pieces count more. Give each piece a weight, multiply each piece by its weight, add them all "
        "up, and divide by the sum of the weights used.")
    p.formula([
        "                  w1.v1 + w2.v2 + ... + wn.vn",
        "weighted average = ---------------------------",
        "                      w1 + w2 + ... + wn",
        "",
        "v = a 0-100 piece (sub-score),   w = its weight (importance).",
    ], "WEIGHTED AVERAGE")
    p.body(
        "A weight of 0.45 means that piece decides 45% of the result; a weight of 0.10 means only 10%. "
        "Dividing by the SUM of the weights actually used is important - it is what lets a missing piece "
        "be skipped without distorting the rest.")


def closing(p):
    p.ln(2)
    p.set_draw_color(*GOLD); p.set_line_width(0.4)
    p.line(MARGIN, p.get_y(), PAGE_W - MARGIN, p.get_y()); p.ln(2.5)
    p.set_x(MARGIN)
    p.set_font("Helvetica", "I", 8.3); p.set_text_color(*GREY)
    p.multi_cell(USABLE, 4.5, t(
        "All weights, benchmarks and difficulty-factor floors/ceilings are stored in the score_config "
        "table and are configurable by the administrator in the Score-Weights page of the dashboard, so "
        "the system can be re-tuned without changing any code. Scores recompute automatically whenever "
        "the underlying data changes. Every formula in this note matches the live calculation exactly."),
        new_x=XPos.LMARGIN, new_y=YPos.NEXT)


def glossary(p, items):
    p.h1("G", "Glossary of terms")
    for term, desc in items:
        if p.get_y() > 266:
            p.add_page()
        p.set_x(MARGIN)
        p.set_font("Helvetica", "B", 9.4); p.set_text_color(*BROWN)
        p.multi_cell(USABLE, 5, t(term), new_x=XPos.LMARGIN, new_y=YPos.NEXT)
        p.set_x(MARGIN + 4)
        p.set_font("Helvetica", "", 9.2); p.set_text_color(*INK)
        p.multi_cell(USABLE - 4, 4.7, t(desc), new_x=XPos.LMARGIN, new_y=YPos.NEXT); p.ln(1.0)
    closing(p)


# ====================================================================
# 1. e-OFFICE
# ====================================================================
def build_eoffice():
    A = (49, 46, 129)
    p = new(A, "e-Office Score")
    p.cover(A, "PERFORMANCE SCORE  -  1 of 6", ["e-Office Score"],
            "File-disposal efficiency from the e-Office file-movement system - how much was cleared, "
            "how fast, how little was left pending, and how steadily it was done.",
            "Clearance 25%   -   Low Pendency 10%   -   Disposal Speed 45%   -   Consistency 20%")

    p.h1("1", "What this score measures and why it exists")
    p.body(
        "Government runs on files. Every proposal, sanction, transfer, payment and clearance moves as an "
        "e-Office file that arrives in an officer's electronic in-tray, is examined, and is either "
        "decided or forwarded. The e-Office Score rates how efficiently that flow was handled. It "
        "rewards an office that cleared a LARGE workload, QUICKLY, leaving LITTLE pending, at a STEADY, "
        "predictable pace. The output is one number from 0 (poor) to 100 (excellent).")
    p.body(
        "Crucially, the four quality indicators below are computed from the officer's OWN figures alone "
        "- they do not depend on who else happens to be on the screen or in the filter. This makes a "
        "score stable and defensible: an officer's measured clearance, pendency, speed and consistency "
        "never change merely because a colleague was added to or removed from a list. Only the final "
        "'difficulty' comparison looks across officers.")
    p.h2("The data taken from the e-Office system")
    p.kv([
        ("Opening Balance (OB)", "files carried over un-disposed at the start of the report period."),
        ("Files Received (FR)", "new files that arrived during the period."),
        ("Files Processed (FP)", "files disposed (decided or forwarded) during the period."),
        ("Files Pending", "files still un-disposed at the end of the period."),
        ("Average time / file", "the mean number of minutes taken per file."),
        ("Median time / file", "the 'typical' (middle) minutes per file when all files are lined up."),
        ("Active days", "the number of distinct days on which the officer actually worked files."),
    ])
    p.body(
        "Two derived quantities are used throughout: the TOTAL WORKLOAD = OB + FR (everything the office "
        "had to deal with), and the DAILY PACE = total workload / active days (how intensely the office "
        "worked).")

    p.h1("2", "The four quality indicators (each 0-100)")
    p.body(
        "The heart of the score is four indicators. Each turns a raw fact into a 0-100 sub-score, and "
        "each is finally clamped (capped) into the 0-100 range so that no single odd ratio can distort "
        "the blend.")

    p.h3("Indicator 1 - Clearance Rate   (weight 25%)")
    p.body(
        "The single most natural question: of everything the office had to handle, what fraction did it "
        "actually dispose? A value of 90 means nine-tenths of the total workload was cleared.")
    p.formula(["Clearance Rate = Files Processed / (Opening Balance + Files Received) x 100"], "INDICATOR 1")
    p.body(
        "Note the denominator is the TOTAL workload, not just receipts. Measuring against receipts alone "
        "would let an office that ignores its backlog look good; measuring against OB + FR closes that "
        "loophole.")

    p.h3("Indicator 2 - Low Pendency   (weight 10%)")
    p.body(
        "The flip side of clearance: how small is the leftover pile relative to the whole workload? A "
        "value of 90 means only one-tenth of the workload remains pending at the end.")
    p.formula(["Low Pendency = ( 1 - Files Pending / (Opening Balance + Files Received) ) x 100"], "INDICATOR 2")
    p.body(
        "Clearance and Low Pendency are related but not identical, because files can also be created or "
        "transferred during the period; keeping both, at 25% and 10%, captures both 'throughput' and "
        "'residue' without double-counting.")

    p.h3("Indicator 3 - Disposal Speed   (weight 45%, the heaviest)")
    p.body(
        "Timeliness is the core of e-Office performance, so speed carries the most weight. It is judged "
        "against a FIXED benchmark of 1200 minutes per file - meaning an office that truly averages "
        "1200 minutes per file scores exactly 50 on this indicator; faster scores more, slower scores "
        "less. Using a fixed benchmark (rather than the cohort average) keeps the score absolute and "
        "stable. Two statistical safeguards make it fair:")
    p.bullets([
        "ROBUST TIME: time per file is taken as 0.65 x median + 0.35 x average. The median (the typical "
        "file) is trusted more than the average, because a handful of unusually large files can inflate "
        "the average and make a generally fast office look slow.",
        "SMALL-SAMPLE STEADYING (empirical-Bayes shrinkage): an office that processed only a few files "
        "has an unreliable speed - luck dominates. So K = 30 'pretend' files at the benchmark are mixed "
        "in. An office with thousands of files is barely affected; one with a handful is pulled towards "
        "the neutral benchmark until it has earned enough real evidence.",
    ])
    p.formula([
        "robust time tEff = 0.65 x median + 0.35 x average",
        "",
        "                   n x tEff + K x REF      n = Files Processed",
        "steadied tStar  =  --------------------     K = 30   REF = 1200",
        "                       n + K",
        "",
        "Disposal Speed = REF / (REF + tStar) x 100",
        "               = 1200 / (1200 + tStar) x 100",
    ], "INDICATOR 3 - DISPOSAL SPEED")
    p.body(
        "The curve REF/(REF+tStar) is deliberately gentle: it rewards being fast without exploding to "
        "infinity for a near-zero time, and it cannot go below 0 or above 100. Edge handling: if only "
        "one of median / average is present, the missing one is set equal to the present one, so the "
        "formula always works.")

    p.h3("Indicator 4 - Consistency   (weight 20%)")
    p.body(
        "A steady office is a well-managed office. Consistency rewards a predictable pace. When the "
        "average time sits close to the median, work is steady and the score is near 100. When the "
        "average is far ABOVE the median, a few very slow files dragged things out, and the score "
        "falls. The exponential curve maps any gap smoothly onto 0-100.")
    p.formula([
        "gap = max( 0 , average - median ) / ( median + 1 )",
        "Consistency = exp( - gap ) x 100",
        "",
        "gap = 0   -> Consistency = 100  (perfectly steady)",
        "gap = 0.7 -> Consistency ~ 50",
    ], "INDICATOR 4 - CONSISTENCY")
    p.body(
        "The 'max(0, ...)' means an office whose average is BELOW its median (very even work) is treated "
        "as perfectly steady rather than rewarded beyond 100. The '+1' in the denominator avoids "
        "dividing by zero when the median is tiny.")

    p.h1("3", "Combining the four into the final score")
    p.h2("Step A - Efficiency (the weighted blend)")
    p.body(
        "The four indicators are blended using weights that add up to exactly 1.00. Disposal Speed "
        "dominates at 45%; Clearance adds 25%, Consistency 20%, and Low Pendency the remaining 10%.")
    p.formula([
        "Efficiency = 0.25 x Clearance",
        "           + 0.10 x Low-Pendency",
        "           + 0.45 x Disposal-Speed",
        "           + 0.20 x Consistency",
        "(result lies between 0 and 100)",
    ], "STEP A - EFFICIENCY")
    p.h2("Step B - the workload (difficulty) factor")
    p.body(
        "Efficiency alone would let an office that perfectly cleared 50 files tie with one that "
        "perfectly cleared 5000. The workload factor corrects this. It combines the VOLUME of files "
        "(OB + FR) with the daily INTENSITY (files per active day), places both on a log scale against "
        "fixed full-credit targets (5000 files and 60 files per day), and converts the result into a "
        "factor whose floor is 0.50.")
    p.formula([
        "avail = OB + FR ;   pace = avail / active-days",
        "load  = log(1 + avail) + 0.5 x log(1 + pace)",
        "Lfull = log(1 + 5000) + 0.5 x log(1 + 60)",
        "W     = clamp( load / Lfull , 0 , 1 )",
        "",
        "Workload factor = 0.50 + 0.50 x W            (0.50 .. 1.00)",
    ], "STEP B - WORKLOAD FACTOR")
    p.body(
        "The lightest workload still keeps half credit (0.50), so a small but excellent office is "
        "dampened, never zeroed; the heaviest workload earns the full 1.00. The 0.5 weight on 'pace' "
        "lets daily intensity add to, but not dominate, raw volume. If 'active days' is missing, the "
        "factor falls back to pure volume.")
    p.h2("The final score")
    p.formula(["e-Office Score = Efficiency x Workload factor          (0 - 100)"], "FINAL e-OFFICE SCORE")

    p.h1("4", "Worked examples")
    p.example("a strong, busy office", [
        "Opening 400, Received 4600  ->  total workload = 5000 files",
        "Processed 4500, Pending 500, median 900 min, average 1100 min, active 90 days",
        "",
        "Clearance    = 4500/5000 x100                 = 90.0",
        "Low Pendency = (1 - 500/5000) x100            = 90.0",
        "tEff  = 0.65x900 + 0.35x1100                  = 970 min",
        "tStar = (4500x970 + 30x1200)/(4500+30)        = 971.5 min",
        "Speed = 1200/(1200+971.5) x100                = 55.3",
        "gap   = (1100-900)/(900+1) = 0.222 ; Consistency = e^-0.222 x100 = 80.1",
        "Efficiency = .25x90 + .10x90 + .45x55.3 + .20x80.1 = 72.4",
        "avail 5000, pace 55.6 -> W ~ 0.98 ; factor = 0.50 + 0.50x0.98 = 0.99",
        "e-Office Score = 72.4 x 0.99 = 71.7",
    ])
    p.example("a small office handled perfectly (why the floor matters)", [
        "Opening 20, Received 80 -> workload 100; Processed 100, Pending 0",
        "median 600, average 620, active 20 days, n = 100",
        "Clearance 100, Low Pendency 100",
        "tEff=607, tStar=(100x607+30x1200)/130=743.7 ; Speed=1200/1943.7x100=61.7",
        "gap=(620-600)/601=0.033 ; Consistency=96.7",
        "Efficiency = .25x100+.10x100+.45x61.7+.20x96.7 = 82.1",
        "Tiny workload -> W ~ 0.55 ; factor = 0.50 + 0.50x0.55 = 0.78",
        "e-Office Score = 82.1 x 0.78 = 64.0",
        "-> excellent quality, but the small load keeps it below the busy office.",
    ])

    p.h1("5", "The statistics, explained from scratch")
    p.h2("Average versus median")
    p.body(
        "The AVERAGE (mean) adds every value and divides by the count. The MEDIAN is the middle value "
        "once all are lined up smallest to largest. They differ when the data is lopsided: a few very "
        "slow files pull the average up but leave the median where it is. Because the median better "
        "represents the 'typical' file, Disposal Speed leans 65% on it and only 35% on the average - "
        "and Consistency literally measures how far apart the two are.")
    p.h2("Empirical-Bayes shrinkage (steadying small samples)")
    p.body(
        "Imagine an office that processed just 4 files, all quick by luck. Its raw speed looks "
        "spectacular but means little. Shrinkage blends the measured value with a neutral prior - here, "
        "K = 30 imaginary files sitting exactly at the 1200-minute benchmark. With thousands of real "
        "files the imaginary 30 are negligible; with only a few, they dominate and pull the office back "
        "to neutral. This is the standard statistical cure for unreliable small samples.")
    p.formula(["steadied value = ( n x measured + K x benchmark ) / ( n + K )"], "SHRINKAGE (GENERAL FORM)")
    p.h2("Logarithms for size")
    p.body(
        "A logarithm turns multiplication into addition: log(10) + log(10) = log(100). On a log scale, "
        "going ten-fold is always the same step. This is exactly what we want for 'size of workload' - "
        "an office handling 5000 files is meaningfully bigger than one handling 500, which is bigger "
        "than 50, in equal felt steps. A plain scale would make the 5000-file office dwarf everyone and "
        "flatten all the others to near zero.")
    p.h2("Clamping (capping)")
    p.body(
        "Every indicator and the factor input are forced into a sensible range (0-100, or 0-1). Real "
        "data occasionally produces impossible ratios (e.g. processing more than were received, due to "
        "timing). Clamping keeps the blend stable and the final number interpretable.")
    p.h2("Weighting")
    p.body(
        "The 25/10/45/20 weights encode policy: speed first, throughput next, steadiness, then residue. "
        "Because they sum to 1.00, the efficiency stays naturally on the 0-100 scale.")

    p.h1("6", "Reading it on the dashboard & FAQ")
    p.body(
        "The e-Office page lists every officer with their four indicators, the Efficiency, the Workload "
        "factor and the final Score, and a state-wide Rank. A Normalised / Absolute switch lets you "
        "view the raw computed scores or the same scores stretched so the best officer reads 100.")
    p.faq([
        ("My clearance is 95% but my score is mid-range. Why?",
         "Speed carries 45% of the weight and the difficulty factor scales the whole thing - high "
         "clearance alone cannot carry the score if files were slow or the workload was light."),
        ("Does adding a filter change my score?",
         "No. The four indicators are absolute (from your own figures). Only the normalised VIEW and "
         "the difficulty comparison look across officers, and the difficulty floor protects small "
         "offices."),
        ("I processed very few files but very fast. Why am I not at the top of Speed?",
         "Small-sample shrinkage pulls a tiny sample towards the benchmark, so a lucky few quick files "
         "cannot create a fake top speed."),
        ("Why is the benchmark 1200 minutes?",
         "It is a fixed reference at which Speed scores 50, chosen so the scale is stable over time. It "
         "is configurable by the administrator if policy changes."),
    ])

    glossary(p, [
        ("Opening Balance / Files Received", "files carried over / newly arrived in the period."),
        ("Total workload", "Opening Balance + Files Received - the denominator for throughput."),
        ("Clearance Rate", "share of total workload disposed (Indicator 1)."),
        ("Low Pendency", "how little remains un-disposed vs the whole workload (Indicator 2)."),
        ("Disposal Speed", "pace per file vs the fixed 1200-min benchmark (Indicator 3)."),
        ("Consistency", "closeness of average to median - steadiness (Indicator 4)."),
        ("Median", "the middle value; robust to a few extreme files."),
        ("Empirical-Bayes shrinkage", "pulling a small-sample figure towards a benchmark for reliability."),
        ("Efficiency", "the weighted blend of the four indicators (Step A)."),
        ("Workload factor", "0.50-1.00 multiplier growing with files handled and daily pace (Step B)."),
        ("Logarithm (log)", "a scale on which equal multiples are equal steps; used for size."),
        ("Clamp / cap", "forcing a value into a fixed range (here 0-100 or 0-1)."),
    ])
    safe_output(p, "01_eOffice_Score_Explained.pdf")
    return p.page_no()


# ====================================================================
# 2. GSDP
# ====================================================================
def build_gsdp():
    A = (12, 74, 110)
    p = new(A, "GSDP Score")
    p.cover(A, "PERFORMANCE SCORE  -  2 of 6", ["GSDP Score"],
            "An officer's contribution to the State's economic targets (Gross State Domestic Product) "
            "for 2025-26, attributed fairly and without double-counting across every post held.",
            "Cells (district x sub-sector)  -  conserving day-share  -  efficiency x target-load factor")

    p.h1("1", "What this score measures")
    p.body(
        "GSDP (Gross State Domestic Product) is the total money value of all goods and services produced "
        "inside Andhra Pradesh in a year. The Government sets, for the year 2025-26, a TARGET and an "
        "ACHIEVEMENT for every combination of a district and an economic sub-sector. We call each such "
        "district-by-sub-sector combination a CELL. For example (Guntur district x Crops) is one cell, "
        "with its own target and achievement in rupees crore.")
    p.body(
        "The GSDP Score measures how well the cells that an officer was responsible for met their "
        "targets - weighted by how long the officer held the relevant posts, and scaled up for officers "
        "who carried a larger total target. It is the only score with a formal CONSERVATION property: "
        "when every officer's attributed GSDP is added together, the grand total equals the State total "
        "(over the cells that have an officer). Nothing is invented; nothing is counted twice.")
    p.h2("The data and the mapping")
    p.kv([
        ("Sector / Sub-sector", "the activity, e.g. Agricultural Sector > Crops, Livestock, Fisheries."),
        ("District", "the geography; one cell = one district x one sub-sector."),
        ("Target 2025-26", "the planned output value for that cell, in rupees crore."),
        ("Achievement 2025-26", "the realised output value for that cell, in rupees crore."),
        ("gsdp_mapping table", "the admin-maintained link from each sub-sector to the Department(s) "
                               "and HoD(s) responsible for it (set on the GSDP-Mapping screen)."),
    ])

    found_posts(p)

    p.h1("2", "Which cells belong to a post")
    p.body(
        "The office status decides the cells, but GSDP uses the mapping table to translate departments "
        "and HoDs into sub-sectors:")
    p.bullets([
        "DISTRICT post -> every sub-sector of that district. A Collector is treated as responsible for "
        "the whole district's economic output, so all of that district's cells belong to the post.",
        "SECRETARIAT post -> only the sub-sectors that the post's DEPARTMENT is mapped to (in "
        "gsdp_mapping), but across ALL districts. A Secretary's reach is state-wide for their subjects.",
        "HoD post -> only the sub-sectors that the post's HoD is mapped to, again across all districts.",
    ])
    p.body("For each cell the raw performance is simply the fraction of the target that was met:")
    p.formula(["cell % achieved = Achievement / Target x 100"], "CELL ACHIEVEMENT")

    p.h2("Merging the same post and clamping to the GSDP year")
    p.body(
        "Before counting days, an officer's records for the SAME post (identical name, location, "
        "department and HoD) are merged so over-lapping or touching stints become one continuous period "
        "and no calendar day is counted twice. Then only the portion of each period that falls inside "
        "the GSDP YEAR - 1 April 2025 to 31 March 2026, i.e. 365 days - is counted. A post held entirely "
        "before or after that window contributes zero.")

    p.h1("3", "Sharing each cell fairly - the conservation principle")
    p.body(
        "A single cell can be the responsibility of more than one post at the same time. The clearest "
        "case: the (District-A x Crops) cell is part of the Collector of District A's responsibility "
        "AND part of the Secretary of Agriculture's responsibility. If the system credited the FULL "
        "target and achievement to BOTH, the State's total would be exaggerated - counted twice. To "
        "prevent this, each cell's value is SPLIT between the posts that cover it, in proportion to the "
        "days each post held it:")
    p.formula([
        "                         (this post's days on the cell)",
        "post's share = cell  x   ----------------------------------",
        "                         (total days of ALL posts on cell)",
        "",
        "applied to BOTH the Target and the Achievement of the cell.",
    ], "CONSERVING DAY-SHARE")
    p.h2("Why it is called 'conservation' (the proof in one line)")
    p.body(
        "Add every post's share of one cell together. Each share is cell x (that post's days / total "
        "days); summing over all posts gives cell x (total days / total days) = cell x 1 = the cell's "
        "full value. So the parts always rebuild the whole. Therefore the sum over ALL officers of "
        "their attributed GSDP equals the sum of the cells - the State total - for every cell that has "
        "at least one officer.")
    p.keynote(
        "two officers responsible for the same target at the same time SPLIT it by their days, instead "
        "of each being handed the entire amount. The books balance to the State total.")
    p.body(
        "Summing a post's shares over all its cells gives the post's PRO-RATA Target and Achievement. "
        "Summing those over the officer's posts gives the officer's AGGREGATED Target and AGGREGATED "
        "Achievement - the rupee figures shown on the dashboard and in the drill-down popup.")

    p.h1("4", "From achievement to the final score")
    p.h2("Step A - Efficiency")
    p.body(
        "Efficiency is the day-weighted average of the posts' % achieved (using each post's in-year "
        "days as the weight). A post that achieved more of its target, and was held longer within the "
        "GSDP year, pulls the efficiency towards its result.")
    p.formula([
        "             SUM ( post % achieved x FY-overlap days )",
        "Efficiency = -------------------------------------------",
        "                     SUM ( FY-overlap days )",
    ], "STEP A - EFFICIENCY")
    p.h2("Step B - the target-load factor")
    found_difficulty(p, "0.70", "the total GSDP target the officer carried",
                     "the officer's AGGREGATED TARGET (rupees crore)")
    p.body(
        "Floor 0.70 and ceiling 1.00 are the defaults; the administrator can change both in the "
        "Score-Weights page. Setting floor = ceiling = 1.00 switches load-weighting off entirely, so "
        "the score becomes pure efficiency.")
    p.h2("The final score")
    p.formula([
        "Load factor = 0.70 + 0.30 x W      (W = log-scaled aggregated target)",
        "GSDP Score  = Efficiency x Load factor            (0 - 100)",
    ], "FINAL GSDP SCORE")

    p.h1("5", "Worked example (the conservation in action)")
    p.example("GSDP", [
        "Officer held Collector-District-A (180 days) and Secretary-Agriculture (120 days),",
        "both within 2025-26. The cell (District-A x Crops) is covered by BOTH posts.",
        "",
        "Cell (A x Crops): Target 100, Achievement 90.",
        "  Collector days on the cell = 180, Secretary days = 120, total = 300.",
        "  Collector's share : Target 100x180/300 = 60, Achievement 90x180/300 = 54.",
        "  Secretary's share : Target 100x120/300 = 40, Achievement 90x120/300 = 36.",
        "  Check: 60 + 40 = 100 (target) and 54 + 36 = 90 (achievement). Conserved.",
        "",
        "After summing every cell of every post:",
        "  Aggregated Target = Rs.500 cr, Aggregated Achievement = Rs.430 cr.",
        "  Day-weighted Efficiency of post % achieved = 88.0",
        "  Large target -> W = 0.80 -> Load = 0.70 + 0.30x0.80 = 0.94",
        "  GSDP Score = 88.0 x 0.94 = 82.7",
    ])

    p.h1("6", "The statistics, explained")
    p.h2("Day-weighted average")
    p.body(
        "Posts are blended using their in-year days as weights, so a longer, better-achieving post "
        "counts for more than a brief stint. Posts outside the GSDP year drop out automatically (zero "
        "in-year days).")
    p.h2("Conservation - why the totals always add up")
    p.body(
        "The day-share split is engineered so the parts rebuild the whole (Section 4 proof). This is the "
        "statistical idea of a partition of unity: each cell's value is multiplied by fractions that sum "
        "to 1, so summing the parts returns the original. The dashboard header even shows the percentage "
        "of the State target that is attributed; any shortfall is simply cells that currently have no "
        "officer mapped to them, not a calculation error.")
    p.h2("Logarithms for the load factor")
    p.body(
        "The target-load factor uses log scaling so that carrying Rs.500 cr of target is recognised as "
        "meaningfully heavier than Rs.50 cr, fairly, without one very large officer dominating the whole "
        "comparison.")
    p.h2("Pro-rata (proportional) arithmetic")
    p.body(
        "Every rupee figure shown for an officer is pro-rata - sliced in proportion to days. This is the "
        "same idea as splitting a shared bill by the time each person was present, applied to targets "
        "and achievements.")

    p.h1("7", "Reading it on the dashboard & FAQ")
    p.body(
        "The GSDP page shows each officer's Sectors Covered, Sub-sectors Covered, Aggregated Target, "
        "Aggregated Achievement, % Achieved, the GSDP Score and a state-wide Rank. Clicking the counts "
        "opens a drill-down: Sector > Sub-sector > Post > Period, every level showing the pro-rata "
        "target, achievement and %. The header shows the State target and the % attributed to officers.")
    p.faq([
        ("Two of us were in charge of the same district sub-sector. Do we both get full credit?",
         "No - you share it by days. Together your shares add back to the cell's full value, so the "
         "State total is never exaggerated."),
        ("I held a high-achieving post for only one month. Why is my score modest?",
         "Day-weighting means a one-month stint contributes only its days to the average, and the "
         "target-load factor reflects the (small) total target you carried in the year."),
        ("What is 'Aggregated Target'?",
         "Your pro-rata share of all the cell targets you were responsible for, after the day-share "
         "split - i.e. the slice of the State target attributed to you."),
        ("The header says only 92% is attributed. Is something wrong?",
         "No - 8% of cells currently have no officer mapped to them (e.g. a vacant subject). Map them "
         "in the GSDP-Mapping screen and the figure rises."),
    ])

    glossary(p, [
        ("Cell", "one district x sub-sector pair, with its own Target and Achievement."),
        ("Target / Achievement", "planned vs realised output for a cell, in rupees crore."),
        ("gsdp_mapping", "admin table linking sub-sectors to Departments and HoDs."),
        ("Pro-rata share", "a cell's value sliced in proportion to a post's days on it."),
        ("Conservation", "the day-share split whose parts always add back to the whole."),
        ("Aggregated Target/Achievement", "an officer's summed pro-rata totals."),
        ("Efficiency", "FY-day-weighted average of post % achieved."),
        ("Target-load factor", "0.70-1.00 multiplier growing with the aggregated target."),
        ("FY 2025-26", "1-Apr-2025 to 31-Mar-2026 (365 days) - the GSDP year."),
        ("Partition of unity", "fractions that sum to 1, used to split a value without loss."),
    ])
    safe_output(p, "02_GSDP_Score_Explained.pdf")
    return p.page_no()


# ====================================================================
# 3. SWARNANDHRA KPI
# ====================================================================
def build_swarna():
    A = (20, 83, 45)
    p = new(A, "Swarnandhra KPI Score")
    p.cover(A, "PERFORMANCE SCORE  -  3 of 6", ["Swarnandhra KPI", "Score"],
            "How the district / department / HoD Key-Performance-Indicators of Swarna Andhra Pradesh "
            "are attributed to each officer through the posts they held and the time they held them.",
            "Per-post = average of matched KPIs        Officer = days-weighted average")

    p.h1("1", "What this score measures")
    p.body(
        "Swarna Andhra Pradesh is the State's flagship outcomes programme. It tracks Key Performance "
        "Indicators (KPIs) - concrete, measurable targets - for every district, every department and "
        "every HoD office. Each KPI is already published on a 0-100 scale, where 100 means the target "
        "was fully met. Because the KPI values themselves already capture the quality of the outcome, "
        "this score does NOT add any difficulty or volume factor. Its only job is to attribute those "
        "ready-made KPI results to the officer who led the place, weighted by how long they led it.")
    p.kv([
        ("KPI row", "one indicator's 0-100 score for a particular district / department / HoD."),
        ("Office status", "decides whether a post is matched to district, department or HoD KPIs."),
        ("Match key", "district name (District post), department (Secretariat), or HoD (HoD post)."),
    ])

    found_posts(p)
    found_days(p)
    found_weighted(p)

    p.h1("2", "Score of one post")
    p.body(
        "A post is matched - by its office status - to the relevant set of KPI rows: the district's KPIs "
        "for a District post, the department's KPIs for a Secretariat post, or the HoD's KPIs for an HoD "
        "post. The post's score is the plain (equal-weighted) average of those matched KPI scores.")
    p.formula([
        "                sum of the matched KPI scores",
        "post score   =  -----------------------------",
        "                number of matched KPIs",
        "",
        "(a post that matches no KPI has no score and is simply skipped)",
    ], "PER-POST SWARNA SCORE")
    p.body(
        "Why a plain average inside a post? Because each KPI is already a calibrated 0-100 outcome "
        "measure of equal standing. Averaging them gives one representative number for how that place "
        "performed during the officer's charge.")

    p.h1("3", "The officer's Swarnandhra KPI score")
    p.body(
        "The officer's posts that DID match some KPI are combined with the days-weighted average. A "
        "longer posting in a high-KPI place therefore counts far more than a brief one.")
    p.formula([
        "               SUM ( post score x tenure days )",
        "Swarna Score = ---------------------------------       (0 - 100)",
        "                     SUM ( tenure days )",
        "",
        "(only posts that matched some KPI are included in either sum)",
    ], "OFFICER SWARNA SCORE")

    p.h1("4", "Worked examples")
    p.example("a two-post officer", [
        "Collector of District A (250 days): District-A KPIs = 80, 76, 78  ->  average 78.0",
        "Secretary of Dept X  (115 days):  Dept-X KPIs  = 60, 68      ->  average 64.0",
        "",
        "Swarna Score = (78.0 x 250 + 64.0 x 115) / (250 + 115)",
        "             = (19500 + 7360) / 365",
        "             = 26860 / 365  =  73.6",
    ])
    p.example("why days matter", [
        "Same KPI averages (78 and 64) but tenures swapped:",
        "  District A only 115 days, Dept X 250 days.",
        "Swarna = (78x115 + 64x250)/365 = (8970+16000)/365 = 68.4",
        "-> The SAME outcomes give a different officer score, because the officer",
        "   spent more time in the lower-KPI place. Time in charge is everything.",
    ])

    p.h1("5", "The statistics, explained")
    p.h2("Averaging the KPIs within a post")
    p.body(
        "All KPIs matched to a post count equally (a plain mean), because each is already a calibrated "
        "0-100 outcome. If a district has many KPIs, the mean is the single fair summary of how that "
        "district did. No KPI is allowed to dominate another.")
    p.h2("Days-weighting across posts")
    p.body(
        "Across the officer's posts we use a weighted average with TENURE DAYS as the weights. This is "
        "the proportionate-days idea: ten months in a district counts far more than ten days. The "
        "second worked example above shows how the same outcomes produce a different officer score "
        "depending purely on where the officer spent their time.")
    p.h2("Why there is no difficulty factor here")
    p.body(
        "Unlike e-Office, GoI Funds and GSDP, the Swarnandhra KPIs already bake outcome quality and "
        "ambition into the 0-100 value. Multiplying again by a 'size' factor would double-count "
        "difficulty, so this score deliberately stops at the days-weighted average.")

    p.h1("6", "Reading it on the dashboard & FAQ")
    p.body(
        "The Swarnandhra page lists each officer's posts, the KPI category each matched, the per-post "
        "score with from / to dates, the number of posts, the final Swarna Score and a state-wide Rank. "
        "Clicking a post opens its periods. A Normalised / Absolute switch is available as on every "
        "score page.")
    p.faq([
        ("I led two high-KPI districts but my score is lower than a colleague's. Why?",
         "Check the tenure days - the colleague may have spent more of the year in their high-KPI "
         "place. The score is days-weighted, so time in charge is decisive."),
        ("A district had ten KPIs and another only two. Does the ten-KPI district count more?",
         "Inside a post the KPIs are averaged, so the COUNT of KPIs does not inflate the post score; "
         "what matters is the average level and the days you held the post."),
        ("Why no difficulty factor like the other scores?",
         "The KPI values already express outcome quality on 0-100. Adding a size factor would "
         "double-count difficulty."),
    ])

    glossary(p, [
        ("KPI", "Key Performance Indicator - a published 0-100 outcome measure."),
        ("Per-post score", "the plain average of the KPIs matched to that post."),
        ("Office status", "District / Secretariat / HoD - selects which KPIs a post matches."),
        ("Tenure days", "days a post was held; the weight in the officer average."),
        ("Days-weighted average", "weighted average using tenure days as the weights."),
    ])
    safe_output(p, "03_Swarnandhra_KPI_Score_Explained.pdf")
    return p.page_no()


# ====================================================================
# 4. GoI FUNDS
# ====================================================================
def build_goi():
    A = (19, 78, 74)
    p = new(A, "GoI Funds Score")
    p.cover(A, "PERFORMANCE SCORE  -  4 of 6", ["GoI Funds Score"],
            "How well an officer utilised Government-of-India Centrally-Sponsored-Scheme (CSS) funds - "
            "spending them well, fully and promptly, with larger funds held for longer counting for more.",
            "AUE 50%  -  FUE 30%  -  FTE 20%   x   day-prorated fund-size difficulty factor")

    p.h1("1", "What this score measures")
    p.body(
        "The Government of India releases money to the States for Centrally-Sponsored Schemes (CSS) - "
        "schemes jointly funded by the Centre and the State. Whether that money actually reaches the "
        "ground and is spent well is a core test of administration. The GoI Funds Score rates exactly "
        "this: a high score means the funds were efficiently spent, fully transferred onward, actually "
        "expended, and not left lying idle. Managing a larger fund earns a higher difficulty factor.")
    p.h2("The five money figures for each scheme")
    p.kv([
        ("GoI Allocation", "the amount the Centre earmarked for the STATE for the scheme."),
        ("Funds Transferred", "the amount the Centre actually released to the state."),
        ("Funds with Agencies", "money in hand with the implementing agencies = the amount "
                                 "transferred PLUS any earlier balance they already held."),
        ("Expenditure", "the amount actually spent on the ground."),
        ("Untapped funds", "DERIVED = Allocation - Transferred. GoI money not yet drawn down "
                            "(still at the Centre)."),
    ])

    found_posts(p)
    found_days(p)

    p.h1("2", "The three efficiency indicators")
    p.body(
        "For Secretariat and HoD posts - which actually manage scheme funds - three ratios are computed. "
        "Each is turned into a percentage and CAPPED to the 0-100 range so a single unusual ratio "
        "cannot distort the blend. There is no separate 'untapped' indicator: since "
        "Untapped = Allocation - Transferred, it is already captured by FTE below.")
    p.bullets([
        "AUE - Allocation Utilisation Efficiency  = Expenditure / GoI Allocation x 100   (weight 50%). "
        "Of all the Centre earmarked for the state, how much actually got spent? The headline outcome.",
        "FUE - Fund Utilisation Efficiency = Expenditure / Funds-with-Agencies x 100   (weight 30%). "
        "Of the money in the agencies' hands, how much was actually put to work?",
        "FTE - Fund Transfer / Drawdown Efficiency = Funds Transferred / GoI Allocation x 100   (weight 20%). "
        "How much of the allocation was drawn down? Because Untapped = Allocation - Transferred, "
        "FTE = 100 - Untapped/Allocation x 100, so a high FTE already means little untapped money.",
    ])
    p.formula([
        "post efficiency (Secretariat / HoD) =",
        "      0.50 x AUE + 0.30 x FUE + 0.20 x FTE",
        "(each indicator first capped to the 0 - 100 range)",
    ], "PER-POST GoI EFFICIENCY")
    p.h3("District posts use a single indicator")
    p.body(
        "A District post reports only 'funds available' (the district's money in hand with agencies) and "
        "'expenditure', so it is scored on a single ratio: District Utilisation = Expenditure / Funds "
        "Available x 100 - the district counterpart of FUE. The same capping applies.")

    p.h1("3", "The officer's GoI Funds score")
    p.body(
        "Each post's efficiency is combined by the days-weighted average (a longer posting counts more) "
        "to give the officer's overall efficiency. Then a difficulty factor, based on a DAY-PRORATED "
        "volume of funds the officer handled, multiplies it.")
    p.formula([
        "day-prorated volume  V =",
        "   SUM over posts ( fund managed in post  x  min(1, days in post / 365) )",
        "",
        "fund managed = GoI Allocation (Sec/HoD)  or  Funds Available (District)",
    ], "DAY-PRORATED FUND VOLUME")
    p.body(
        "The min(1, days/365) term is the day-proration: a post held the whole year contributes its whole "
        "fund; a post held 73 days contributes only 73/365 = 0.20 of it. So the volume - and the score - "
        "grows with BOTH the fund size and the days actually served.")
    found_difficulty(p, "0.70", "the day-prorated volume of GoI funds the officer handled",
                     "the officer's day-prorated GoI fund volume across schemes (rupees crore)")
    p.formula([
        "Efficiency = days-weighted average of the post efficiencies",
        "Volume     = 0.70 + 0.30 x W   (W = log-scaled day-prorated fund volume)",
        "",
        "GoI Funds Score = Efficiency x Volume              (0 - 100)",
    ], "FINAL GoI FUNDS SCORE")

    p.h1("4", "Worked example")
    p.example("GoI Funds", [
        "Scheme under a Secretary post, held the full year (365 days):",
        "  Allocation Rs.100 cr, Transferred Rs.90 cr, with Agencies Rs.80 cr,",
        "  Expenditure Rs.72 cr.   (Untapped = 100 - 90 = Rs.10 cr, captured by FTE.)",
        "",
        "AUE = 72 / 100 x100 = 72.0",
        "FUE = 72 / 80  x100 = 90.0",
        "FTE = 90 / 100 x100 = 90.0",
        "post efficiency = .50x72 + .30x90 + .20x90 = 81.0",
        "",
        "Officer efficiency (days-weighted across posts) = 81.0",
        "Held full year -> volume = full Rs.100 cr; large in cohort -> W = 0.90",
        "Volume factor = 0.70 + 0.30x0.90 = 0.97",
        "GoI Funds Score = 81.0 x 0.97 = 78.6",
    ])

    p.h1("5", "The statistics, explained")
    p.h2("Ratios and capping")
    p.body(
        "Each indicator is a ratio of two money figures, turned into a percentage. Because of timing "
        "(money spent this quarter may exceed what agencies hold this instant), a ratio can legitimately "
        "exceed 100. Capping every indicator to 0-100 keeps all three comparable and the blend stable.")
    p.h2("The weights as policy")
    p.body(
        "The 50 / 30 / 20 split is a statement of priority: actual spend against the allocation (AUE) "
        "matters most; spend against what is in hand (FUE) next; drawing the money down (FTE) last. "
        "Untapped money is NOT a separate slice because it is Allocation - Transferred, already inside "
        "FTE - adding it again would double-count the same fact. The weights are editable in the Admin "
        "Console and the score normalises by their sum, so they need not total exactly 1.00.")
    p.h2("Day-proration and the difficulty factor")
    p.body(
        "Posts are blended by tenure days, and the fund volume that feeds the difficulty factor is "
        "day-prorated - each post's fund counted only in proportion to min(1, days/365). So an officer "
        "who held a large fund for the whole year carries far more volume than one who held it briefly. "
        "The difficulty factor (log-scaled, floor 0.70) then makes utilising a large, long-held fund well "
        "outrank doing the same with a small or briefly-held one. The log scale makes equal multiples of "
        "fund size equal steps.")

    p.h1("6", "Reading it on the dashboard & FAQ")
    p.body(
        "The GoI Funds page lists each officer's matched posts (unique), the number of distinct schemes, the "
        "aggregated allocation / transferred / expenditure, the Score and a state-wide Rank. A drill-down "
        "shows each post's No. of Days, schemes and money figures. There is the usual Normalised / "
        "Absolute switch.")
    p.faq([
        ("My AUE is only 60% but I transferred everything. Why is my score not higher?",
         "AUE (actual spend vs allocation) carries the most weight - 50%. Drawing money down (FTE) is "
         "only 20%. The score rewards money that is SPENT, not merely moved."),
        ("Why is there no separate 'untapped' indicator any more?",
         "Untapped = Allocation - Transferred, which is exactly what FTE (Transferred / Allocation) "
         "already measures. A high FTE means a small untapped pile; a separate term would double-count it."),
        ("I ran a big fund well but only for two months. Why is my score modest?",
         "The fund volume is day-prorated: two months counts about 60/365 of the fund. The difficulty "
         "factor therefore credits you for a smaller volume than a full-year holder of the same fund."),
        ("Can an indicator really be over 100%?",
         "Yes, due to timing (this period's spend can exceed what agencies hold this instant). Each "
         "indicator is capped to 100 so the blend stays fair."),
    ])

    glossary(p, [
        ("CSS / GoI Funds", "Centrally-Sponsored-Scheme money released by the Centre."),
        ("GoI Allocation", "the amount earmarked for the state for a scheme."),
        ("With Agencies", "money in hand with agencies = transferred + any earlier balance."),
        ("Untapped", "Allocation - Transferred; GoI money not yet drawn down."),
        ("AUE", "Expenditure / Allocation - did the earmarked money get spent."),
        ("FUE", "Expenditure / Funds-with-Agencies - spend vs what is in hand."),
        ("FTE", "Funds Transferred / Allocation - drawdown (also captures untapped)."),
        ("Capping", "forcing each ratio into the 0-100 range."),
        ("Efficiency", "weighted blend of the three indicators (or DUE for districts)."),
        ("Day-prorated volume", "fund x min(1, days/365), summed across posts."),
        ("Volume factor", "0.70-1.00 multiplier growing with the day-prorated fund volume."),
    ])
    safe_output(p, "04_GoI_Funds_Score_Explained.pdf")
    return p.page_no()


# ====================================================================
# 5. PUBLIC PERCEPTION
# ====================================================================
def build_perception():
    A = (154, 52, 18)
    p = new(A, "Public Perception Score")
    p.cover(A, "PERFORMANCE SCORE  -  5 of 6", ["Public Perception", "Score"],
            "What citizens feel - sentiment from Information & Public Relations citizen surveys, "
            "credited to the officer for the district and the time they were actually in charge.",
            "Per-post = average of matching surveys        Officer = days-weighted average")

    p.h1("1", "What this score measures")
    p.body(
        "Administration ultimately serves citizens, and how citizens FEEL about governance is a "
        "performance signal in its own right. The Information & Public Relations (I&PR) department runs "
        "citizen surveys - called campaigns - across districts. Each survey returns a sentiment score on "
        "a 0-100 scale, higher meaning more positive public opinion. This score credits an officer with "
        "the public perception of the district they led - but ONLY for the survey periods that fall "
        "within their own tenure there, so nobody is blamed or praised for another's time.")
    p.kv([
        ("Campaign / Survey", "a citizen-feedback exercise carried out in a district."),
        ("Sentiment score", "the survey's 0-100 result for that district and period."),
        ("Survey period", "the date range the survey covers - matched against the officer's tenure."),
        ("District", "the geography; perception is a district-level measure."),
    ])

    found_posts(p, extra=False)
    found_days(p)

    p.h1("2", "Score of one post")
    p.body(
        "For a district post the system selects the survey rows for THAT district whose survey period "
        "overlaps the officer's tenure in the post, and averages their sentiment scores. That average "
        "is the post's perception score. The period match is the careful part: an officer is judged "
        "only on the public mood DURING their own charge - surveys before they arrived or after they "
        "left are excluded.")
    p.formula([
        "post score = average sentiment of the matching survey rows",
        "",
        "matching = (correct district) AND",
        "           (survey period overlaps the officer's tenure)",
    ], "PER-POST PERCEPTION SCORE")

    p.h1("3", "The officer's Public Perception score")
    p.body(
        "The posts that matched surveys are combined by the days-weighted average, so a longer stint in "
        "a district counts proportionally more. Posts that matched no survey are skipped.")
    p.formula([
        "                   SUM ( post score x tenure days )",
        "Perception Score = ---------------------------------     (0 - 100)",
        "                        SUM ( tenure days )",
    ], "OFFICER PERCEPTION SCORE")
    p.keynote(
        "an officer is judged on public mood only for the PLACE and the TIME they were actually in "
        "charge, and a longer tenure carries more weight.")

    p.h1("4", "Worked example")
    p.example("Public Perception", [
        "Collector of District A, tenure Jan-Sep (260 days).",
        "  District-A surveys whose period falls in Jan-Sep: 72, 75, 78  ->  average 75.0",
        "Collector of District B, tenure Oct-Dec (92 days).",
        "  District-B surveys in Oct-Dec: 66  ->  average 66.0",
        "",
        "Perception Score = (75.0 x 260 + 66.0 x 92) / (260 + 92)",
        "                 = (19500 + 6072) / 352",
        "                 = 25572 / 352  =  72.6",
    ])

    p.h1("5", "The statistics, explained")
    p.h2("Averaging survey rows")
    p.body(
        "Several surveys may cover one district during a single tenure; their plain mean gives one "
        "representative sentiment for that post. Each survey is already a calibrated 0-100 measure, so "
        "equal weighting within a post is appropriate.")
    p.h2("Period matching - attributing mood to the right person")
    p.body(
        "Only surveys whose period overlaps the officer's tenure are counted. This is what stops an "
        "officer from inheriting a predecessor's good (or bad) reputation, or being credited for a "
        "successor's. It ties the public mood to the exact window the officer was responsible.")
    p.h2("Days-weighting across posts")
    p.body(
        "As with the other tenure-based scores, posts are blended using tenure days as the weights, and "
        "over-lapping stints are merged first so no calendar day is counted twice.")
    p.h2("Why perception has no difficulty factor")
    p.body(
        "Public sentiment is already an outcome on a 0-100 scale; there is no natural 'size of load' to "
        "scale it by, so the score stops at the days-weighted average - exactly like the Swarnandhra "
        "KPI score.")

    p.h1("6", "Reading it on the dashboard & FAQ")
    p.body(
        "The Public Perception page lists each officer's posts, the campaigns matched, the per-post "
        "score with from / to dates, the number of posts, the Perception Score and a state-wide Rank. "
        "Clicking a post opens its periods. The Normalised / Absolute switch is available as elsewhere.")
    p.faq([
        ("A bad survey was taken just before I took charge. Does it count against me?",
         "No. Only surveys whose period overlaps YOUR tenure are counted; earlier ones belong to your "
         "predecessor's record."),
        ("I served in two districts. How are they combined?",
         "Each district post gets its own average from its matching surveys; the two are then blended "
         "by your tenure days in each."),
        ("My district had no survey during my time. What happens?",
         "That post simply has no perception score and is skipped - it neither helps nor hurts your "
         "overall Perception Score."),
    ])

    glossary(p, [
        ("Campaign / Survey", "an I&PR citizen-feedback exercise in a district."),
        ("Sentiment score", "the survey's 0-100 result."),
        ("Survey period", "the date range a survey covers."),
        ("Period matching", "counting a survey only if its dates overlap the officer's tenure."),
        ("Per-post score", "average sentiment of the post's matching surveys."),
        ("Days-weighted average", "weighted average using tenure days as the weights."),
    ])
    safe_output(p, "05_Public_Perception_Score_Explained.pdf")
    return p.page_no()


# ====================================================================
# 6. PROFESSIONAL PERFORMANCE INDEX
# ====================================================================
def build_ppi():
    A = (76, 29, 149)
    p = new(A, "Professional Performance Index")
    p.cover(A, "COMBINED SCORE  -  6 of 6", ["Professional", "Performance Index"],
            "The single overall score - a normalised, weighted blend of the five component scores - "
            "with a fair, state-wide ranking among officers who share the same set of scores.",
            "e-Office  +  Swarnandhra KPI  +  GoI Funds  +  Public Perception  +  GSDP")

    p.h1("1", "What this score measures")
    p.body(
        "Each of the five component scores looks at one slice of an officer's work. To compare officers "
        "overall, those slices must be brought together into one number out of 100 - the Professional "
        "Performance Index (PPI). The five components are e-Office, Swarnandhra KPI, GoI Funds, Public "
        "Perception and GSDP. Each is produced by its own method (see its own note); the PPI is purely "
        "about COMBINING them fairly - which raises three real problems it must solve:")
    p.bullets([
        "the five may sit on slightly different spreads, so they must be put on one ruler first;",
        "not every officer has all five (a new posting may have no survey yet), so the blend must cope "
        "with missing pieces without punishing the officer;",
        "comparing an officer with five scores against one with two would be unfair, so ranking must be "
        "done within like-for-like groups.",
    ])

    found_normalise(p)
    found_weighted(p)

    p.h1("2", "Step 1 - put the five on the same ruler")
    p.body(
        "Although every component is already 0-100, the spread of values can differ. So each component "
        "is min-max normalised across all officers, making the best officer on each component exactly "
        "100 and the weakest 0. This guarantees that, under equal weights, each component truly "
        "contributes equally - no component dominates merely because its raw numbers happen to be larger "
        "or more spread out.")
    p.body(
        "A Normalised / Absolute switch lets a viewer instead see the raw 'Absolute' component scores; "
        "in that mode the components are blended as-is, without re-stretching. The default view is "
        "Normalised.")

    p.h1("3", "Step 2 - the weighted average over the AVAILABLE scores")
    p.body(
        "The PPI is the weighted average of ONLY the components the officer actually has. By default "
        "every component carries equal weight (so the PPI is a simple average of whatever exists), but "
        "the administrator can set different weights in the Score-Weights page - for example to make "
        "e-Office count double.")
    p.formula([
        "        SUM ( weight_i x score_i )          summed ONLY over the",
        "PPI  =  ----------------------------        components the officer",
        "             SUM ( weight_i )               actually HAS",
        "",
        "components i = e-Office, Swarna, GoI, Perception, GSDP",
        "default weight_i = 1 for every component  (a simple average)",
    ], "PROFESSIONAL PERFORMANCE INDEX")
    p.keynote(
        "an officer is never penalised for a score that does not exist yet - the index is the fair "
        "average of whatever they DO have. Dividing by the sum of the weights USED is what makes a "
        "missing component harmless.")

    p.h1("4", "Step 3 - ranking 'within the combination'")
    p.body(
        "Ranking an officer who has all five scores directly against one who has only two would be "
        "unfair - more scores simply means more chances to be high or low. So officers are grouped by "
        "WHICH set of scores they possess - their 'combination' - and the rank shown is the officer's "
        "position, state-wide, among everyone who has EXACTLY the same combination.")
    p.body(
        "The dashboard lets you pick a combination from a long list - for example 'All 5 Scores', "
        "'Except GoI Funds', or a pair like 'e-Office + GSDP' - and it ranks officers only within that "
        "group. A coverage matrix on the report page shows how many officers fall into each "
        "combination.")

    p.h1("5", "Worked example")
    p.example("Professional Performance Index", [
        "Officer's normalised component scores:",
        "  e-Office 80, Swarna 74, GoI 85, Perception 70, GSDP 83",
        "",
        "Equal weights (all = 1):",
        "  PPI = (80 + 74 + 85 + 70 + 83) / 5  =  392 / 5  =  78.4",
        "",
        "Administrator raises e-Office weight to 2 (others stay 1):",
        "  PPI = (2x80 + 74 + 85 + 70 + 83) / (2+1+1+1+1)",
        "      = (160 + 312) / 6  =  472 / 6  =  78.7",
        "",
        "If this officer had only e-Office + GSDP (a 2-score combination):",
        "  PPI = (80 + 83) / 2 = 81.5",
        "  ...and they are ranked only against others who also have exactly those two.",
    ])

    p.h1("6", "The statistics, explained")
    p.h2("Why normalise before averaging")
    p.body(
        "Averaging numbers on different spreads silently lets the widest-spread component dominate. "
        "Normalising every component to an identical 0-100 spread removes that bias, so equal weights "
        "really do mean equal influence.")
    p.h2("A weighted average over a variable set of inputs")
    p.body(
        "The key subtlety is dividing by the SUM OF THE WEIGHTS ACTUALLY USED, not by a fixed 5. That is "
        "what lets an officer with three scores be judged on the fair average of those three, neither "
        "rewarded nor punished for the two they lack.")
    p.h2("Like-for-like ranking")
    p.body(
        "Grouping by the combination of available scores keeps the ranking honest when data coverage "
        "differs between officers. It is the same principle as comparing students only within the same "
        "set of subjects they sat.")
    p.h2("Normalised versus Absolute")
    p.body(
        "Normalised view answers 'where does this officer stand relative to peers on each component?'; "
        "Absolute view answers 'what did this officer actually score?'. Both are offered; the index and "
        "rank shown follow whichever view is selected.")

    p.h1("7", "Reading it on the dashboard & FAQ")
    p.body(
        "The Professional Performance Index page shows, for each officer, the five component scores "
        "(each with its own rank in the group), the final Index, and the state-wide Rank within the "
        "selected combination. Clicking a component jumps to that score's full page with the officer "
        "highlighted. The report PDF includes a coverage matrix of all combinations.")
    p.faq([
        ("I only have three of the five scores. Am I being penalised?",
         "No. The index averages only the scores you have (dividing by the weights used), and you are "
         "ranked only against others with the same three."),
        ("Why did my Index change when I switched Normalised / Absolute?",
         "Normalised stretches each component to 0-100 across peers; Absolute uses the raw component "
         "scores. The blend, and therefore the Index, differs between the two views."),
        ("Can the weights be changed?",
         "Yes - the administrator sets them in the Score-Weights page (default is equal weight for all "
         "five). Changing a weight re-blends the Index for everyone."),
        ("Why rank 'within the combination' instead of one big list?",
         "Because more available scores means more chances to be high or low; comparing only "
         "like-for-like groups keeps the ranking fair."),
    ])

    glossary(p, [
        ("Component score", "one of the five inputs (e-Office, Swarna, GoI, Perception, GSDP)."),
        ("Normalise (min-max)", "stretch each component to 0-100 across all officers."),
        ("Weight", "the importance given to a component (default 1 = equal)."),
        ("Available scores", "the components an officer actually has data for."),
        ("Combination", "the exact set of scores an officer has; ranking is within the same set."),
        ("Absolute vs Normalised", "a page switch to view raw component scores or the stretched ones."),
        ("PPI", "Professional Performance Index - the combined, weighted, 0-100 score."),
    ])
    safe_output(p, "06_Professional_Performance_Index_Explained.pdf")
    return p.page_no()


if __name__ == "__main__":
    results = [
        ("01_eOffice_Score_Explained.pdf", build_eoffice()),
        ("02_GSDP_Score_Explained.pdf", build_gsdp()),
        ("03_Swarnandhra_KPI_Score_Explained.pdf", build_swarna()),
        ("04_GoI_Funds_Score_Explained.pdf", build_goi()),
        ("05_Public_Perception_Score_Explained.pdf", build_perception()),
        ("06_Professional_Performance_Index_Explained.pdf", build_ppi()),
    ]
    print("Generated:")
    for name, pages in results:
        print("  %-48s %2d pages" % (name, pages))
