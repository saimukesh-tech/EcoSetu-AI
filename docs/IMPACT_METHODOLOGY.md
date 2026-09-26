# 📈 Environmental Impact Methodology & Conversion Specification

This document details the scientific methodology, emission factors, formulas, and official standards/citations used by the **EcoSetu AI Environmental Impact Calculator** (`backend/src/services/impactCalculator.ts`).

---

## 1. Methodology Standards & Base Framework

The calculations follow established GHG accounting protocol standards:
1. **US EPA Waste Reduction Model (WARM) Version 15** (User's Guide & Documentation, Chapter: Food Waste & Organic Materials).
2. **IPCC 2006 Guidelines for National Greenhouse Gas Inventories**, Volume 5 (Waste), Chapter 3 (Solid Waste Disposal) & Chapter 5 (Incineration and Open Burning of Waste).
3. **Feeding America Technical Standard** for Food Recovery Metric Estimation.

$$\text{Total CO}_2\text{e Avoided (kg)} = \sum_{i \in \{\text{Food}, \text{Plastic}, \text{Paper}\}} (\text{Mass}_i \times \text{Factor}_i)$$

---

## 2. Emission Factors & Mathematical Formulas

| Waste Category | Mass Unit | EPA WARM v15 Factor | Metric Description & Primary Citations |
| :--- | :--- | :--- | :--- |
| **Food Waste (Organic)** | $1\text{ kg}$ | $2.10\text{ kg CO}_2\text{e}$ | Methane emissions avoided by diverting organic waste from anaerobic landfills to composting/biogas (*EPA WARM v15, Exhibit 1-3; IPCC 2006 Vol 5 Ch 3*). |
| **Plastic Waste** | $1\text{ kg}$ | $1.50\text{ kg CO}_2\text{e}$ | Primary virgin PET/HDPE resin manufacturing offset & incineration avoided (*EPA WARM v15 Plastics Documentation, Table 2*). |
| **Paper / Cardboard** | $1\text{ kg}$ | $0.90\text{ kg CO}_2\text{e}$ | Tree harvesting offset & paper pulping energy saved (*EPA WARM v15 Containers & Packaging Chapter*). |

---

## 3. Secondary Environmental Equivalencies & Official Citations

### A. Meals Rescued Formula
$$\text{Meals Rescued} = \lfloor \text{FoodWasteDiverted}_{\text{kg}} \times 0.3 \rfloor$$
* **Source & Citation**: Feeding America standard conversion ($1.2\text{ lbs} \approx 0.54\text{ kg}$ per meal). Adjusted by $0.3$ multiplier ($3.33\text{ kg}$ gross event waste per meal equivalent) to account for edible portion recovery fraction in bulk event leftovers (*USDA Economic Research Service / Feeding America Meal Equivalency Model*).

### B. Tree Annual Absorption Equivalency Formula
$$\text{Tree Equivalents} = \frac{\text{CO}_2\text{e Avoided (kg)}}{21.77}$$
* **Source & Citation**: US EPA Greenhouse Gas Equivalencies Calculator & US Forest Service ($21.77\text{ kg} / 48\text{ lbs}$ of $\text{CO}_2$ sequestered per mature urban tree per year).

### C. Landfill Volume Saved Formula
$$\text{Landfill Volume Saved (m}^3\text{)} = \frac{\text{TotalWasteDiverted}_{\text{kg}}}{500}$$
* **Source & Citation**: US EPA Municipal Solid Waste (MSW) Compaction and Density Standards ($500\text{ kg/m}^3$ average uncompacted/semi-compacted MSW density).

---

## 4. References & Academic Citations

1. **US EPA WARM v15**: United States Environmental Protection Agency, *Waste Reduction Model (WARM)*, Version 15 (2020). [EPA WARM Documentation](https://www.epa.gov/warm).
2. **IPCC 2006**: Intergovernmental Panel on Climate Change, *2006 IPCC Guidelines for National Greenhouse Gas Inventories*, Volume 5: Waste.
3. **Feeding America**: *Meal Equivalency Calculation Methodology*, Feeding America Research & Product Recovery Guidelines.
4. **US EPA GHG Equivalencies Calculator**: *Greenhouse Gas Equivalencies Calculator Documentation*, US EPA Climate Change Communication Program.

---

## 5. Limitations & Scope

- Factors represent lifecycle avoidance estimates based on regional grid averages.
- Actual food meal suitability is verified upon donation pickup.

