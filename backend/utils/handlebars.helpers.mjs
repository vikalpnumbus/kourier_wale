import hbs from "handlebars";

// ALL helpers (simple ones)
const handlebarsHelpers = {
  formatDate(timestamp) {
    if (!timestamp) return "";
    const d = new Date(timestamp);

    const year = d.getFullYear();
    const day = String(d.getDate()).padStart(2, "0");
    const month = d.toLocaleString("en-IN", { month: "short" });

    return `${month} ${day}, ${year}`;
  },

  uppercase(str) {
    if (!str) return "";
    return String(str).toUpperCase();
  },

  jsonStringify(str) {
    if (!str) return "";
    return JSON.stringify(str, null, 2);
  },

  ucwords(str) {
    if (!str) return "";
    return String(str)
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());
  },

  formatNumber(num, decimals = 2) {
    if (num === null || num === undefined || isNaN(Number(num))) return "-";
    return Number(num).toFixed(decimals);
  },

  truncateProductName(name) {
    if (!name) return "";
    const cleaned = String(name)
      .replace(/\u00A0/g, " ")
      .replace(/[()+\/\-,]/g, " ");
    return cleaned.length > 12 ? cleaned.substr(0, 12) : cleaned;
  },

  and(a, b) {
    return a && b;
  },

  not(v) {
    return !v;
  },

  eq(a, b) {
    console.log('a,b',a==b)
    return a == b;
  },

  gt(a, b) {
    return Number(a) > Number(b);
  },
};

// SPECIAL HELPERS: let + assign
function registerExtraHelpers() {
  // creates a local variable
  hbs.registerHelper("let", function (value, options) {
    const varName = options.hash.as;

    // create child context
    const newScope = Object.assign({}, this);
    newScope[varName] = value;

    return options.fn(newScope);
  });

  // assigns into root
  hbs.registerHelper("assign", function (key, value, options) {
    options.data.root[key] = value;
  });

  hbs.registerHelper("replaceNbsp", function (text) {
    if (!text) return "";
    return text.replace(/\u00A0/g, " "); // replace non-breaking spaces
  });

  hbs.registerHelper("removeChars", function (text, ...args) {
    if (!text) return "";

    // Last argument is Handlebars options object
    const options = args.pop();

    // Remaining arguments are actual characters
    const chars = args;

    const escaped = chars.join("").replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");

    const regex = new RegExp("[" + escaped + "]", "g");

    return text.replace(regex, "");
  });

  hbs.registerHelper("substr", function (text, start, len) {
    if (!text) return "";
    return text.substring(start, start + len);
  });

  hbs.registerHelper("divide", function (value, divisor) {
    if (!value || !divisor) return 0;
    return (value / divisor).toFixed(2);
  });

  hbs.registerHelper("split", function (str, delimiter) {
    return str ? str.split(delimiter) : [];
  });
}

// register all simple helpers
function registerHandlebarsHelpers() {
  Object.entries(handlebarsHelpers).forEach(([name, fn]) => {
    hbs.registerHelper(name, fn);
  });

  // register the extra helpers separately
  registerExtraHelpers();
}

export { registerHandlebarsHelpers };
export default handlebarsHelpers;
