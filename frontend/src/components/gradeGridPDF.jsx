import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf
} from "@react-pdf/renderer";
import { gridService } from "../services/assessmentsService";

// ── utils ─────────────────────────────────────────────────────────────────
export function buildGradeGrid(results) {
  if (!Array.isArray(results)) results = [];

  const studentsMap = {};
  const unitsMap = {};

  for (const r of results) {
    if (!studentsMap[r.student_full_name]) studentsMap[r.student_full_name] = {};
    if (!studentsMap[r.student_full_name][r.course_unit]) studentsMap[r.student_full_name][r.course_unit] = {};
    studentsMap[r.student_full_name][r.course_unit][r.course_module] = r.score;

    if (!unitsMap[r.course_unit]) unitsMap[r.course_unit] = new Set();
    unitsMap[r.course_unit].add(r.course_module);
  }

  const courseUnits = Object.entries(unitsMap).map(([label, modulesSet]) => ({
    label,
    modules: [...modulesSet],
  }));

  const students = Object.entries(studentsMap).map(([name, unitData]) => {
    let totalScore = 0;
    for (const unit of courseUnits) {
      for (const mod of unit.modules) {
        const score = unitData[unit.label]?.[mod] ?? null;
        if (score !== null) totalScore += score;
      }
    }
    return { name, unitData, totalScore };
  });

  return { courseUnits, students };
}

// ── constantes ────────────────────────────────────────────────────────────
const COL_NAME_WIDTH  = 110;
const COL_MOD_WIDTH   = 45;
const COL_GRAND_TOTAL = 55;
const ROW_H           = 22;

// ── styles ────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: { padding: 30, fontSize: 7, fontFamily: "Helvetica" },

  pageHeader: { marginBottom: 16 },
  pageTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 8,
  },
  infoRow: { flexDirection: "row", gap: 16 },
  infoLabel: { fontFamily: "Helvetica-Bold" },

  table: { borderWidth: 1, borderColor: "#333" },
  row: { flexDirection: "row" },

  thUnit: {
    backgroundColor: "#4472C4",
    borderRightWidth: 1,
    borderColor: "#fff",
    padding: 3,
    justifyContent: "center",
    alignItems: "center",
  },
  thUnitText: {
    color: "white",
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
  },

  thMod: {
    backgroundColor: "#D9E1F2",
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    padding: 3,
    height: ROW_H,
    justifyContent: "center",
    alignItems: "center",
  },
  thModText: { fontFamily: "Helvetica-Bold", textAlign: "center" },

  cellName: {
    width: COL_NAME_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    padding: 3,
    height: ROW_H,
    justifyContent: "center",
  },

  cellScore: {
    width: COL_MOD_WIDTH,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    padding: 3,
    height: ROW_H,
    justifyContent: "center",
    alignItems: "center",
  },

  cellGrandTotal: {
    width: COL_GRAND_TOTAL,
    borderRightWidth: 0.5,
    borderBottomWidth: 0.5,
    borderColor: "#999",
    padding: 3,
    height: ROW_H,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E2EFDA",
  },

  bold: { fontFamily: "Helvetica-Bold" },
});

// ── composant PDF ─────────────────────────────────────────────────────────
export function GradeGridPDF({ results, formation, semester, schoolYear }) {
  const { courseUnits, students } = buildGradeGrid(results || []);

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page} wrap>

        {/* ── EN-TÊTE ── */}
        <View style={s.pageHeader}>
          <Text style={s.pageTitle}>Grille de notes</Text>
          <View style={s.infoRow}>
            <Text><Text style={s.infoLabel}>Formation : </Text>{formation}</Text>
            <Text><Text style={s.infoLabel}>Semestre : </Text>{semester}</Text>
            <Text><Text style={s.infoLabel}>Année scolaire : </Text>{schoolYear}</Text>
          </View>
        </View>

        {/* ── TABLEAU ── */}
        <View style={s.table}>

          {/* Ligne d'en-tête */}
          <View style={s.row}>

            {/* Coin "Étudiant" double hauteur */}
            <View style={[s.thMod, {
              width: COL_NAME_WIDTH,
              height: ROW_H * 2,
              justifyContent: "flex-end",
              borderColor: "#999",
            }]}>
              <Text style={s.thModText}>Étudiant</Text>
            </View>

            {/* Unités : nom en ligne 1, modules en ligne 2 */}
            {courseUnits.map(unit => (
              <View key={unit.label} style={{ flexDirection: "column" }}>
                <View style={[s.thUnit, {
                  width: unit.modules.length * COL_MOD_WIDTH,
                  height: ROW_H,
                }]}>
                  <Text style={s.thUnitText}>{unit.label}</Text>
                </View>
                <View style={{ flexDirection: "row" }}>
                  {unit.modules.map(mod => (
                    <View key={mod} style={[s.thMod, { width: COL_MOD_WIDTH }]}>
                      <Text style={s.thModText} numberOfLines={2}>{mod}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ))}

            {/* Total général double hauteur */}
            <View style={[s.thUnit, {
              width: COL_GRAND_TOTAL,
              height: ROW_H * 2,
              justifyContent: "center",
            }]}>
              <Text style={s.thUnitText}>{"Total\ngénéral"}</Text>
            </View>

          </View>

          {/* Lignes étudiants */}
          {students.map((student, i) => (
            <View
              key={student.name}
              style={[s.row, i % 2 !== 0 && { backgroundColor: "#F9F9F9" }]}
            >
              <View style={s.cellName}>
                <Text numberOfLines={1}>{student.name}</Text>
              </View>

              {courseUnits.map(unit => (
                <View key={unit.label} style={{ flexDirection: "row" }}>
                  {unit.modules.map(mod => {
                    const score = student.unitData[unit.label]?.[mod] ?? null;
                    return (
                      <View key={mod} style={s.cellScore}>
                        <Text>{score !== null ? score.toFixed(1) : "—"}</Text>
                      </View>
                    );
                  })}
                </View>
              ))}

              <View style={s.cellGrandTotal}>
                <Text style={s.bold}>{student.totalScore.toFixed(1)}</Text>
              </View>
            </View>
          ))}

        </View>
      </Page>
    </Document>
  );
}

// ── téléchargement ────────────────────────────────────────────────────────
export default async function DownloadGradeGrid(formation, semester, schoolYear) {
  try {
    const response = await gridService.retrieve({
      formation: formation?.id,
      semester: semester?.id,
      school_year: schoolYear?.id,
    });
    const results = response?.results ?? response ?? [];

    if (!Array.isArray(results) || results.length === 0) {
      console.warn("DownloadGradeGrid: aucun résultat reçu");
    }

    const formationLabel  = formation?.text  || formation?.name  || formation?.code  || "";
    const semesterLabel   = semester?.code   || semester?.text   || semester?.name   || "";
    const schoolYearLabel = schoolYear?.text || schoolYear?.name || schoolYear?.code || "";

    const blob = await pdf(
      <GradeGridPDF
        results={results}
        formation={formationLabel}
        semester={semesterLabel}
        schoolYear={schoolYearLabel}
      />
    ).toBlob();

    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `grille-notes-${semesterLabel}-${schoolYearLabel}.pdf`;
    link.click();
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("Erreur génération PDF :", err);
  }
}