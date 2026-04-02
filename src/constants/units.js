export const UNIT_TYPES = ["LENGTH", "WEIGHT", "VOLUME", "TEMPERATURE"];

export const UNITS_BY_TYPE = {
  LENGTH: ["FEET", "INCH", "YARD", "CENTIMETER"],
  WEIGHT: ["KILOGRAM", "GRAM", "POUND"],
  VOLUME: ["LITRE", "MILLILITRE", "GALLON"],
  TEMPERATURE: ["CELSIUS", "FAHRENHEIT", "KELVIN"]
};

export const OPERATIONS = [
  { id: 'convert', label: 'Convert' },
  { id: 'compare', label: 'Compare' },
  { id: 'add', label: 'Add' },
  { id: 'subtract', label: 'Subtract' },
  { id: 'divide', label: 'Divide (Ratio)' }
];
