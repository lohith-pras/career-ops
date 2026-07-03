# Article Digest -- Proof Points

<!-- USER LAYER. Never auto-updated. Every entry below is sourced directly
     from cv.md -- no fact here should exist that isn't already in the CV.
     This file exists to give evaluation/drafting modes richer proof points
     to draw on than the CV's compressed bullet form. -->

## AI/ML & Agentic Workflows

### Accept-on-Retest (AI Agent), NI Dresden (Oct 2025 - Mar 2026)
- Built an end-to-end Accept-on-Retest analysis framework from scratch, merging variance data and parametric measurements across 30-40 test types from large-scale manufacturing datasets.
- Chose Polars over Pandas after benchmarking both on massive datasets; implemented Parquet caching for metadata querying to avoid redundant data requests.
- Wrote custom logic to classify 1σ-3σ bands without external libraries -- splitting results into actual failures, marginal cases, and noise.
- Shipped as an NI Nigel Skill: a markdown-defined skill with modular Python scripts, invokable via natural language.
- Adopted in production by manufacturing engineers for root cause analysis and natural-language summaries with visualizations -- zero coding required from the end user.
- Authored two LaTeX handover documents and trained the incoming intern on the framework's foundations.

**What this demonstrates:** shipping an LLM-agent feature that non-technical users actually adopted in production, not a demo or prototype. Relevant for AI/ML Engineer, Agentic Workflows, LLMOps-adjacent roles.

### Parametric Test Pattern Analysis, NI Dresden
- Analyzed manufacturing variance datasets for failure trends, feeding results directly into downstream ML modeling scope.
- Co-developed a Euclidean distance-based ranking algorithm for parametric test data; responsible for final integration into NI's new proprietary data storage architecture.
- Extended the algorithm from single-test to test-agnostic operation across 30-40 VST test types without breaking legacy compatibility.
- Integrated Plotly visualizations into NI Nigel's conversational UI so engineering teams could query pattern results without writing code.

**What this demonstrates:** data pipeline design and cross-test generalization at production scale. Relevant for AI/ML and RF/Test & Measurement roles alike.

## RF / Wireless / Test & Measurement

- Direct exposure to VST (Vector Signal Transceiver) measurement data across 30-40 test types at NI, a test & measurement company.
- M.Sc. Electromobility coursework: MIMO Systems, 5G/6G Architectures, DSP Architectures.
- Skills: MIMO, OFDM, 5G/6G Test Systems, RF Signal Processing.

**What this demonstrates:** working RF domain knowledge paired with the software layer that processes RF test data -- the combination is the differentiator, not either half alone.

## Embedded / Automotive EV Systems

### Embedded Systems Intern, Delta X Automotive (Dec 2022 - Aug 2023)
- Programmed STM32 microcontrollers in Embedded C for EV powertrain control and cutting-system logic, reducing startup time by 25%.
- Integrated FreeRTOS into CAN-based ECUs to improve task scheduling and system reliability.
- Collaborated with hardware engineers to validate low-voltage and high-voltage architecture integration using Simulink.

**What this demonstrates:** hands-on embedded C on real EV hardware, not coursework simulation. Relevant for embedded/automotive EV Werkstudent roles.

### Visible Light Communication System for V2V Applications in EVs (Project)
- Developed an STM32-based prototype for Vehicle-to-Vehicle communication using OOK optical modulation with Turbo Coding for Forward Error Correction, reducing Bit Error Rate (BER) in noisy optical channels.
- Simulated LED driver circuitry in Multisim for voltage stability verification; modeled an MPPT algorithm in MATLAB for solar-powered transceiver efficiency.

**What this demonstrates:** combines embedded systems, communications/signal processing, and automotive EV context in a single project -- useful proof point for roles spanning more than one archetype.

### Secure IoT Data Transmission with AES and MQTT (Project)
- Built an ESP32-based IoT node for real-time encrypted sensor data transmission using MQTT with AES-128 encryption at the edge; configured SPIFFS for secure key management and persistent device authentication.

**What this demonstrates:** embedded security fundamentals, relevant when a JD touches connected-device or IoT security scope.

---

## Notes for evaluation/drafting modes

- Do not invent metrics beyond what's listed above -- every number here is copied from `cv.md`.
- If a JD needs a proof point not covered here (e.g. specific 5G protocol stack experience, specific AUTOSAR/CAN tooling), flag it as a gap rather than inferring it from adjacent skills.
- German proficiency is A2 (elementary, actively improving) per `cv.md` -- do not overstate this in cover letters or forms.
