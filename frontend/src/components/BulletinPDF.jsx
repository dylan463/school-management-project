// BulletinPDF.jsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf
} from "@react-pdf/renderer";
import { enrollmentService } from "../services/assessmentsService";
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },

  // ── EN-TÊTE ──────────────────────────────────────────────
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    marginBottom: 12,
    textAlign: "center",
  },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  infoItem: {
    width: "48%",
    marginBottom: 4,
  },
  infoLabel: {
    fontFamily: "Helvetica-Bold",
  },

  // ── CORPS ────────────────────────────────────────────────
  body: {
    marginBottom: 24,
  },
  table: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  unitHeader: {
    flexDirection: "row",
    backgroundColor: "#4472C4",
    padding: 5,
  },
  unitHeaderText: {
    color: "white",
    fontFamily: "Helvetica-Bold",
    flex: 1,
  },
  colHeader: {
    flexDirection: "row",
    backgroundColor: "#D9E1F2",
  },
  row: {
    flexDirection: "row",
  },
  rowAlt: {
    flexDirection: "row",
    backgroundColor: "#F5F5F5",
  },
  cellModule: {
    flex: 3,
    borderWidth: 0.5,
    borderColor: "#999",
    padding: 4,
  },
  cellSmall: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#999",
    padding: 4,
    textAlign: "center",
  },
  cellBold: {
    fontFamily: "Helvetica-Bold",
  },

  // ── PIED DE PAGE ─────────────────────────────────────────
  footer: {
    marginTop: 8,
  },
  totalTable: {
    borderWidth: 1,
    borderColor: "#333",
  },
  totalRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderColor: "#999",
  },
  totalRowLast: {
    flexDirection: "row",
    backgroundColor: "#E2EFDA",   // vert pâle pour la moyenne
  },
  totalLabel: {
    flex: 2,
    padding: 5,
    fontFamily: "Helvetica-Bold",
  },
  totalValue: {
    flex: 1,
    padding: 5,
    textAlign: "center",
    borderLeftWidth: 0.5,
    borderColor: "#999",
  },
});

export function BulletinPDF(props) {
  const { enrollment, coursUnits, map, totalCredit, totalScore, average } = props;

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>

        {/* ── EN-TÊTE ── */}
        <View style={styles.header}>
          <Text style={styles.title}>Relevé de notes</Text>
          <View style={styles.infoGrid}>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mention : </Text>
              {enrollment.student.mention.text}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Semestre : </Text>
              {enrollment.semester.code}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nom : </Text>
              {enrollment.student.full_name}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Formation : </Text>
              {enrollment.formation.text}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Matricule : </Text>
              {enrollment.student.username}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={styles.infoLabel}>Année scolaire : </Text>
              {enrollment.school_year.text}
            </Text>
          </View>
        </View>

        {/* ── CORPS ── */}
        <View style={styles.body}>
          {coursUnits.map(unit => (
            <View key={unit.label} style={styles.table} wrap={false}>

              {/* Titre de l'unité */}
              <View style={styles.unitHeader}>
                <Text style={styles.unitHeaderText}>{unit.label}</Text>
              </View>

              {/* En-têtes des colonnes */}
              <View style={styles.colHeader}>
                <Text style={[styles.cellModule, styles.cellBold]}>Module</Text>
                <Text style={[styles.cellSmall, styles.cellBold]}>Crédit</Text>
                <Text style={[styles.cellSmall, styles.cellBold]}>Note</Text>
              </View>

              {/* Lignes modules */}
              {unit.modules.map((module, i) => (
                <View key={module} style={i % 2 === 0 ? styles.row : styles.rowAlt}>
                  <Text style={styles.cellModule}>{module}</Text>
                  <Text style={styles.cellSmall}>
                    {map[unit.label][module].credit}
                  </Text>
                  <Text style={styles.cellSmall}>
                    {map[unit.label][module].score}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* ── PIED ── */}
        <View style={styles.footer}>
          <View style={styles.totalTable}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Crédit total</Text>
              <Text style={styles.totalValue}>{totalCredit}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Note totale</Text>
              <Text style={styles.totalValue}>{totalScore}</Text>
            </View>
            <View style={styles.totalRowLast}>
              <Text style={styles.totalLabel}>Moyenne générale</Text>
              <Text style={styles.totalValue}>{average.toFixed(2)}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}

export default async function  downloadBulletin(enrollmentId){
    const {matrix} = await enrollmentService.bulletin(enrollmentId)
    const enrollment = await enrollmentService.retrieve(enrollmentId)
    const {coursUnits,map,totalScore,totalCredit,average} = matrix

    const doc = (
        <BulletinPDF
        enrollment={enrollment}
        coursUnits={coursUnits}
        map={map}
        totalCredit={totalCredit}
        totalScore={totalScore}
        average={average}
        />
    );

    const blob = await pdf(doc).toBlob();

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `bulletin-${enrollment.student.username}.pdf`;

    a.click();

    URL.revokeObjectURL(url);  
}