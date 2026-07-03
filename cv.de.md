# Lohith Tarikere Prasanna

Nürnberg, Deutschland | lnlohith3@gmail.com | +49 155 107 52969
[LinkedIn](https://www.linkedin.com/in/loh-pras/) | [GitHub](https://github.com/lohith-pras)

---

## Zusammenfassung

Masterstudent im Fachbereich Elektromobilität an der FAU Erlangen-Nürnberg (Schwerpunkte: KI & Konnektivität) mit
Berufserfahrung in der Entwicklung und Implementierung von Workflows für KI-Agenten in Produktionsumgebungen
Messdaten. Bei NI Dresden wurde eigenständig eine durchgängige KI-Agenten-Funktion entwickelt
in NI Nigel integriert und von nicht-technischen Ingenieuren in die Produktion übernommen. Kern
Zu den Stärken zählen Python-basierte Datenpipelines, durch LLM koordinierte Tools und Signalverarbeitung
für 5G-/6G-Systeme.

---

## Berufserfahrung

### National Instruments GmbH (NI, mittlerweile Teil von Emerson) – KI-Workflows bei HF-Messungen, Praktikant
Oktober 2025 – März 2026 | Dresden, Deutschland

**Projekt 1: Parametrische Testmusteranalyse**

- Analyse von Datensätzen zu Fertigungsabweichungen hinsichtlich Fehlertrends; Ergebnisse wurden direkt weitergeleitet
  in den Anwendungsbereich der nachgelagerten ML-Modellierung.
- Mitentwickler eines auf dem euklidischen Abstand basierenden Ranking-Algorithmus für parametrische Testdaten; verantwortlich für
  die endgültige Integration in die neue proprietäre Datenspeicherarchitektur von NI.
- Der Algorithmus wurde von einer eintestbezogenen auf eine testunabhängige Funktionsweise für 30–40 VST-Tests erweitert
  Typen, ohne die bestehende Kompatibilität zu beeinträchtigen.
- Plotly-Visualisierungen in die dialogorientierte Benutzeroberfläche von NI Nigel integriert, damit Ingenieurteams
  könnte Musterergebnisse abfragen, ohne Code schreiben zu müssen.

**Projekt 2: „Accept-on-Retest“ (AoR) – Fähigkeiten eines KI-Agenten**

- Entwicklung und Aufbau eines durchgängigen „Accept-on-Retest“-Analyse-Frameworks von Grund auf,
  die Zusammenführung von Daten zu Abweichungen und parametrischen Messwerten aus 30 bis 40 Prüfarten aus
  große Datensätze aus der Fertigung.
- Ich habe mich nach einem Vergleich beider Lösungen anhand umfangreicher Daten für Polars statt für Pandas entschieden; dazu habe ich
  Parquet-Caching für die Abfrage von Metadaten und zur Vermeidung redundanter Datenanfragen.
- Entwicklung einer benutzerdefinierten Logik zur Klassifizierung von 1σ–3σ-Bändern ohne externe Bibliotheken, einschließlich Split-Test
  Ergebnisse in tatsächliche Fehler, Grenzfälle und Rauschen.
- Entwicklung des AoR-Frameworks als Skill für NI Nigel – ein mit Markdown definierter Skill mit modularem Aufbau
  Python-Skripte, die über eine Abfrage in natürlicher Sprache aufgerufen werden können.
- Fertigungsingenieure nutzten es in der Produktion, um Testdaten abzufragen, Ursachenanalysen durchzuführen,
  und erhalten Sie Zusammenfassungen in natürlicher Sprache mit Visualisierungen – ganz ohne Programmierkenntnisse.
- Ich habe zwei LaTeX-Übergabedokumente verfasst und eine abschließende technische Präsentation gehalten, bevor ich
  dem neuen Praktikanten die Grundlagen vermitteln.

### Delta X Automotive Pvt. Ltd. – Praktikant im Bereich eingebettete Systeme
Dezember 2022 – August 2023 | Bengaluru, Indien

- Programmierung von STM32-Mikrocontrollern in Embedded C für die Steuerung von Elektrofahrzeug-Antriebssträngen und Schneidsystemen
  die Startzeit um 25 %.
- Integration von FreeRTOS in CAN-basierte Steuergeräte zur Verbesserung der Task-Planung und der Systemzuverlässigkeit.
- Zusammenarbeit mit Hardware-Ingenieuren zur Validierung der Integration der Nieder- und Hochspannungsarchitektur mithilfe von Simulink.

---

## Projekte

### Kommunikationssystem mit sichtbarem Licht für V2V-Anwendungen bei Elektrofahrzeugen

- Entwicklung eines STM32-basierten Prototyps für die Fahrzeug-zu-Fahrzeug-Kommunikation unter Verwendung der optischen OOK-Modulation
  Modulation mit Turbo-Codierung zur Vorwärtsfehlerkorrektur, wodurch die Fehlerrate (BER) in rauschbehafteten optischen Systemen reduziert wird
  Kanäle.
- Simulierte LED-Treiberschaltung in Multisim zur Überprüfung der Spannungsstabilität; Modellierung einer
  MPPT-Algorithmus in MATLAB zur Steigerung der Energieeffizienz solarbetriebener Transceiver.

### Sichere IoT-Datenübertragung mit AES und MQTT

- Entwicklung eines ESP32-basierten IoT-Knotens für die verschlüsselte Echtzeit-Übertragung von Sensordaten unter Verwendung von
  MQTT mit AES-128-Verschlüsselung am Netzwerkrand; SPIFFS für sicheres Schlüsselmanagement konfiguriert und
  Dauerhafte Geräteauthentifizierung.

---

## Fähigkeiten

**Sprachen & Frameworks:** Python (Polars, pandas, scikit-learn, Plotly), Embedded C,
MATLAB, Simulink, Verilog

**KI- und LLM-Tools:** Entwicklung von LLM-Agenten-Fähigkeiten (Anthropic-Framework), Prompt-Engineering,
GitHub Copilot, Claude Code

**Daten & Pipelines:** Parquet-Caching, Datenverarbeitung in großem Maßstab, ML-Anomalieerkennung,
statistische Signalanalyse

**Embedded-Systeme:** STM32, FreeRTOS, CAN-Bus, UART/SPI, VESC-Tool

**HF & Kommunikation:** MIMO, OFDM, 5G/6G-Testsysteme, VST-Messdaten, HF-Signal
Verarbeitung

**Tools und Plattformen:** Git, Azure DevOps, NI Nigel, Overleaf/LaTeX, Cadence Virtuoso,
Multisim, MQTT

---

## Bildung

### Friedrich-Alexander-Universität Erlangen-Nürnberg (FAU) – M.Sc. Elektromobilität
April 2024 – heute | Erlangen-Nürnberg, Deutschland
Studienschwerpunkte: KI und autonomes Fahren, Konnektivität
Relevante Lehrveranstaltungen: MIMO-Systeme, 5G/6G-Architekturen, DSP-Architekturen, Energieinformatik und Smart Grids

### Dayananda Sagar College of Engineering – Bachelor of Engineering (B.E.) in Elektronik und Kommunikationstechnik
August 2019 – August 2023 | Bengaluru, Indien

---

## Zertifizierungen

- **Anthropic Academy – Model Context Protocol (MCP)** (Mai 2026) – offizielle Zertifizierung
  mit den Schwerpunkten MCP-Architektur, Integration von Agentenfähigkeiten und Gestaltung agentenbasierter Arbeitsabläufe.

---

## Sprachen

- **Englisch:** C1 – Sehr gute Kenntnisse (GER)
- **Deutsch:** A2 – Grundkenntnisse; aktive Verbesserung
