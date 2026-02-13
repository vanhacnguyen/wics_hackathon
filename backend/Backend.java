import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.net.URLDecoder;


/**
 * Usage examples:
 *   javac Backend.java
 *   java Backend -f SantaClara.csv -key city -value Cupertino
 *   java Backend -f SantaClara.csv -key lang -value English -key city -value Cupertino
 *
 * Behavior:
 * - Repeated -key/-value pairs are ANDed together
 * - Matching is case-insensitive
 * - For comma-separated fields like languages/categories, match is "contains token"
 * - Outputs JSON to stdout: {"meta":{"count":N},"results":[{...}, ...]}
 */
public class Backend {
    private static String decode(String s) {
        try {
            return URLDecoder.decode(s, StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }
    private static class Filter {
        String key;
        String value;
        Filter(String k, String v) { key = k; value = v; }
    }

    public static void main(String[] args) {
        try {
            List<Filter> filters = new ArrayList<>();
            String file = null;

            // Parse args
            for (int i = 0; i < args.length; i++) {
                String a = args[i];

                if (a.equals("-f") || a.equals("-file")) {
                    if (i + 1 >= args.length) dieJson("Missing value after " + a);
                    file = args[++i];
                } else if (a.equals("-key")) {
                    if (i + 1 >= args.length) dieJson("Missing value after -key");
                    String key = args[++i];
                    // Expect -value next (but tolerate out-of-order)
                    if (i + 1 < args.length && args[i + 1].equals("-value")) {
                        i++;
                        if (i + 1 >= args.length) dieJson("Missing value after -value");
                        String value = args[++i];
                        filters.add(new Filter(key, decode(value)));
                    } else {
                        dieJson("Expected -value after -key " + key);
                    }
                } else {
                    // Unknown arg; ignore or error. For hackathon, better to error clearly.
                    dieJson("Unknown argument: " + a);
                }
            }

            if (file == null || file.trim().isEmpty()) {
                dieJson("Missing -f <csvfile>");
            }

            // Load CSV
            List<Map<String, String>> rows = readCsv(file);

            // Apply filters
            List<Map<String, String>> matched = new ArrayList<>();
            for (Map<String, String> row : rows) {
                if (matchesAll(row, filters)) {
                    matched.add(row);
                }
            }

            // Output JSON
            printJson(matched, filters);

        } catch (Exception e) {
            // Never crash with stack trace; always return JSON error
            dieJson("Server error: " + e.getMessage());
        }
    }

    // --- Matching logic ---

    private static boolean matchesAll(Map<String, String> row, List<Filter> filters) {
        for (Filter f : filters) {
            String key = normalizeKey(f.key);
            String val = (f.value == null) ? "" : f.value.trim();

            // If key not found, fail
            if (!row.containsKey(key)) return false;

            String cell = safe(row.get(key));

            if (!matchesCell(key, cell, val)) {
                return false;
            }
        }
        return true;
    }

    private static boolean matchesCell(String key, String cell, String want) {
        String c = cell.trim();
        String w = want.trim();

        if (w.isEmpty()) return true; // treat empty filter as no-op

        // Case-insensitive comparisons
        String cLow = c.toLowerCase(Locale.ROOT);
        String wLow = w.toLowerCase(Locale.ROOT);

        // For fields that are comma-separated lists, match by token containment.
        // (languages: "English,Spanish,Vietnamese")
        if (key.equals("languages") || key.equals("categories") || key.equals("tags")) {
            List<String> tokens = splitCommaTokens(c);
            for (String t : tokens) {
                if (t.equalsIgnoreCase(w)) return true;
            }
            // also allow partial containment fallback (helpful if data is messy)
            return cLow.contains(wLow);
        }

        // For city/state/postal_code: prefer exact match (case-insensitive)
        if (key.equals("city") || key.equals("state") || key.equals("postal_code")) {
            return cLow.equals(wLow);
        }

        // Default: contains match (case-insensitive)
        return cLow.contains(wLow);
    }

    private static List<String> splitCommaTokens(String s) {
        List<String> out = new ArrayList<>();
        for (String part : s.split(",")) {
            String t = part.trim();
            if (!t.isEmpty()) out.add(t);
        }
        return out;
    }

    // Map wrapper-friendly keys to CSV headers
    private static String normalizeKey(String key) {
        String k = safe(key).trim().toLowerCase(Locale.ROOT);

        // Aliases you mentioned:
        if (k.equals("lang") || k.equals("language")) return "languages";
        if (k.equals("cat") || k.equals("category")) return "categories";

        // common header variants
        if (k.equals("zipcode") || k.equals("zip")) return "postal_code";
        if (k.equals("longitude") || k.equals("long")) return "lng";
        if (k.equals("latitude")) return "lat";

        return k; // assume matches header
    }

    // --- CSV reader (handles quoted commas) ---

    private static List<Map<String, String>> readCsv(String filePath) throws IOException {
        File f = new File(filePath);
        if (!f.exists()) dieJson("CSV file not found: " + filePath);

        try (BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(f), StandardCharsets.UTF_8))) {
            String headerLine = br.readLine();
            if (headerLine == null) dieJson("CSV file is empty");

            List<String> headersRaw = parseCsvLine(headerLine);
            List<String> headers = new ArrayList<>();
            for (String h : headersRaw) {
                headers.add(safe(h).trim().toLowerCase(Locale.ROOT));
            }

            List<Map<String, String>> rows = new ArrayList<>();
            String line;
            while ((line = br.readLine()) != null) {
                if (line.trim().isEmpty()) continue;

                List<String> cells = parseCsvLine(line);

                Map<String, String> row = new HashMap<>();
                for (int i = 0; i < headers.size(); i++) {
                    String key = headers.get(i);
                    String val = (i < cells.size()) ? cells.get(i) : "";
                    row.put(key, safe(val));
                }

                // Optional: skip rows with missing coordinates (helps map UI)
                // If you want to include them anyway, comment these out.
                String lat = row.getOrDefault("lat", "").trim();
                String lng = row.getOrDefault("lng", "").trim();
                if (lat.isEmpty() || lng.isEmpty()) continue;

                rows.add(row);
            }
            return rows;
        }
    }

    // CSV parsing: supports quotes and commas inside quotes.
    private static List<String> parseCsvLine(String line) {
        List<String> out = new ArrayList<>();
        StringBuilder sb = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char ch = line.charAt(i);

            if (ch == '"') {
                // Handle escaped quotes ("")
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    sb.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch == ',' && !inQuotes) {
                out.add(sb.toString());
                sb.setLength(0);
            } else {
                sb.append(ch);
            }
        }
        out.add(sb.toString());
        return out;
    }

    // --- JSON output (manual, safe escaping) ---

    private static void printJson(List<Map<String, String>> matched, List<Filter> filters) {
        StringBuilder json = new StringBuilder();
        json.append("{\"meta\":{");
        json.append("\"count\":").append(matched.size()).append(",");
        json.append("\"filters\":{");

        // echo filters back (normalized keys)
        for (int i = 0; i < filters.size(); i++) {
            Filter f = filters.get(i);
            String k = normalizeKey(f.key);
            String v = safe(f.value);

            if (i > 0) json.append(",");
            json.append("\"").append(escapeJson(k)).append("\":");
            json.append("\"").append(escapeJson(v)).append("\"");
        }
        json.append("}},"); // end filters, end meta
        json.append("\"results\":[");

        for (int i = 0; i < matched.size(); i++) {
            if (i > 0) json.append(",");
            json.append(rowToJson(matched.get(i)));
        }

        json.append("]}");
        System.out.print(json.toString());
    }

    private static String rowToJson(Map<String, String> row) {
        // Output common fields if present (keeps response stable and clean)
        // You can add/remove fields here without breaking parsing too much.
        String[] fields = new String[] {
                "name", "categories", "languages",
                "address_line1", "city", "state", "postal_code",
                "phone", "website", "cost_notes", "eligibility",
                "lat", "lng"
        };

        StringBuilder sb = new StringBuilder();
        sb.append("{");

        boolean first = true;
        for (String f : fields) {
            if (!row.containsKey(f)) continue;

            String val = safe(row.get(f)).trim();
            if (val.isEmpty()) continue;

            if (!first) sb.append(",");
            first = false;

            sb.append("\"").append(escapeJson(f)).append("\":");

            // lat/lng as numbers if possible
            if (f.equals("lat") || f.equals("lng")) {
                Double num = tryParseDouble(val);
                if (num == null) sb.append("null");
                else sb.append(num);
            } else if (f.equals("categories") || f.equals("languages")) {
                // emit arrays for these
                sb.append(listToJsonArray(splitCommaTokens(val)));
            } else {
                sb.append("\"").append(escapeJson(val)).append("\"");
            }
        }

        sb.append("}");
        return sb.toString();
    }

    private static String listToJsonArray(List<String> items) {
        StringBuilder sb = new StringBuilder();
        sb.append("[");
        for (int i = 0; i < items.size(); i++) {
            if (i > 0) sb.append(",");
            sb.append("\"").append(escapeJson(items.get(i))).append("\"");
        }
        sb.append("]");
        return sb.toString();
    }

    private static Double tryParseDouble(String s) {
        try {
            return Double.parseDouble(s);
        } catch (Exception ignored) {
            return null;
        }
    }

    private static String escapeJson(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            switch (ch) {
                case '\\': sb.append("\\\\"); break;
                case '"':  sb.append("\\\""); break;
                case '\n': sb.append("\\n"); break;
                case '\r': sb.append("\\r"); break;
                case '\t': sb.append("\\t"); break;
                default:
                    if (ch < 0x20) {
                        sb.append(String.format("\\u%04x", (int) ch));
                    } else {
                        sb.append(ch);
                    }
            }
        }
        return sb.toString();
    }

    private static String safe(String s) {
        return (s == null) ? "" : s;
    }

    private static void dieJson(String message) {
        String msg = escapeJson(safe(message));
        System.out.print("{\"error\":\"" + msg + "\"}");
        System.exit(1);
    }
}
