# 📈 Environmental Impact Methodology & Conversion Specification

This document details the scientific methodology, emission factors, formulas, and assumptions used by the **EcoSetu AI Environmental Impact Calculator** (`backend/src/services/impactCalculator.ts`).

---

## 1. Methodology Standards & Base Framework

The calculations follow **EPA Waste Reduction Model (WARM) v15** and **IPCC Guidelines for National Greenhouse Gas Inventories**:

$$\text{Total CO}_2\text{e Avoided (kg)} = \sum_{i \in \{\text{Food}, \text{Plastic}, \text{Paper}\}} (\text{Mass}_i \times \text{Factor}_i)$$

---

## 2. Emission Factors & Mathematical Formulas

| Waste Category | Mass Unit | EPA WARM v15 Factor | Metric Description & Assumptions |
| :--- | :--- | :--- | :--- |
| **Food Waste (Organic)** | $1\text{ kg}$ | $2.10\text{ kg CO}_2\text{e}$ | Methane emissions avoided by diverting organic waste from anaerobic landfills to composting or biogas |
| **Plastic Waste** | $1\text{ kg}$ | $1.50\text{ kg CO}_2\text{e}$ | Primary virgin resin production offset & incineration avoided |
| **Paper / Cardboard** | $1\text{ kg}$ | $0.90\text{ kg CO}_2\text{e}$ | Tree harvesting offset & paper manufacturing energy saved |

---

## 3. Secondary Environmental Equivalencies

### A. Meals Rescued Formula
$$\text{Meals Rescued} = \lfloor \text{FoodWasteDiverted}_{\text{kg}} \times 0.3 \rfloor$$
*Assumptions: Based on Feeding America and EPA standards where 1 edible meal equivalent is approximately $3.33\text{ kg}$ ($0.3\text{ meals per kg}$).*

### B. Tree Annual Absorption Equivalency Formula
$$\text{Tree Equivalents} = \frac{\text{CO}_2\text{e Avoided (kg)}}{21.77}$$
*Assumptions: One mature tree absorbs approximately $21.77\text{ kg}$ ($48\text{ lbs}$) of $CO_2$ per year.*

### C. Landfill Volume Saved Formula
$$\text{Landfill Volume Saved (m}^3\text{)} = \frac{\text{TotalWasteDiverted}_{\text{kg}}}{500}$$
*Assumptions: Uncompacted mixed municipal waste average density is $500\text{ kg/m}^3$ ($0.5\text{ tonnes/m}^3$).*

---

## 4. Limitations & Scope

- Factors represent lifecycle avoidance estimates based on regional grid averages.
- Actual food meal suitability is verified upon donation pickup.
