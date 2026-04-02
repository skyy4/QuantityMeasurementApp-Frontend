export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export const UNITS = {
  LengthUnit: ["FEET", "INCH", "YARD", "CENTIMETER"],
  WeightUnit: ["KILOGRAM", "GRAM", "POUND"],
  VolumeUnit: ["LITRE", "MILLILITRE", "GALLON"],
  TemperatureUnit: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

export const OPERATIONS = [
  { id: 'convert', label: 'Convert' },
  { id: 'compare', label: 'Compare' },
  { id: 'add', label: 'Add' },
  { id: 'subtract', label: 'Subtract' },
  { id: 'divide', label: 'Divide (Ratio)' }
];
