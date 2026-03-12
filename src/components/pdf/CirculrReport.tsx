import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: "#1C1C1C",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
    paddingBottom: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0A",
    letterSpacing: 2,
  },
  date: {
    fontSize: 9,
    color: "#999999",
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 12,
    color: "#0A0A0A",
  },
  subtitle: {
    fontSize: 10,
    color: "#666666",
    marginTop: 4,
  },
  content: {
    fontSize: 11,
    lineHeight: 1.6,
    color: "#2A2A2A",
  },
  paragraph: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0A0A0A",
    marginTop: 16,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 48,
    right: 48,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
    paddingTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: "#AAAAAA",
  },
});

interface CirculrReportProps {
  title: string;
  clientName: string;
  content: string;
  date: string;
}

export function CirculrReport({
  title,
  clientName,
  content,
  date,
}: CirculrReportProps) {
  // Split content into paragraphs and detect headings (lines starting with # or all-caps)
  const lines = content.split("\n");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <Text style={styles.logo}>CIRCULR</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>Preparado para: {clientName}</Text>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {lines.map((line, i) => {
            const trimmed = line.trim();
            if (!trimmed) return <Text key={i} style={{ marginBottom: 6 }}> </Text>;

            // Detect markdown headings
            if (trimmed.startsWith("## ")) {
              return (
                <Text key={i} style={styles.sectionTitle}>
                  {trimmed.replace(/^##\s*/, "")}
                </Text>
              );
            }
            if (trimmed.startsWith("# ")) {
              return (
                <Text key={i} style={{ ...styles.sectionTitle, fontSize: 16 }}>
                  {trimmed.replace(/^#\s*/, "")}
                </Text>
              );
            }
            // Bullet points
            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <Text key={i} style={styles.paragraph}>
                  {"  •  " + trimmed.slice(2)}
                </Text>
              );
            }

            return (
              <Text key={i} style={styles.paragraph}>
                {trimmed}
              </Text>
            );
          })}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Documento generado por CIRCULR. Confidencial.
          </Text>
          <Text style={styles.footerText}>circulr.es</Text>
        </View>
      </Page>
    </Document>
  );
}
