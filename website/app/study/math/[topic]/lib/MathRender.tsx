import { type Expression } from "nerdamer-prime";
import "katex/dist/katex.min.css";
import Latex from "react-latex";

function changeInverseTrigFunctions(input: string) {
    return input
        .replace(/\\mathrm\{asin\}/g, "\\sin^{-1}")
        .replace(/\\mathrm\{acos\}/g, "\\cos^{-1}")
        .replace(/\\mathrm\{atan\}/g, "\\tan^{-1}")
        .replace(/\\mathrm\{acsc\}/g, "\\csc^{-1}")
        .replace(/\\mathrm\{asec\}/g, "\\sec^{-1}")
        .replace(/\\mathrm\{acot\}/g, "\\cot^{-1}")
        .replaceAll("asin(", "\\sin^{-1}(")
        .replaceAll("acos(", "\\cos^{-1}(")
        .replaceAll("atan(", "\\tan^{-1}(")
        .replaceAll("acsc(", "\\csc^{-1}(")
        .replaceAll("asec(", "\\sec^{-1}(")
        .replaceAll("acot(", "\\cot^{-1}(");
}
function changeLog(input: string) {
    return input.replaceAll("log", "\\ln");
}

function removeCDot(input: string) {
    return input.replaceAll("\\cdot", "");
}

function normalizeMathSyntax(input: string) {
    return removeCDot(changeLog(changeInverseTrigFunctions(input)))
        .replaceAll("Î¸", "\\theta")
        .replaceAll("π", "\\pi");
}

function normalizePlainMathFragment(input: string) {
    return input
        .replaceAll("*", "\\cdot ")
        .replace(/(sin|cos|tan|csc|sec|cot)theta/g, "\\$1\\theta")
        .replace(/\b(sin|cos|tan|csc|sec|cot)\(/g, "\\$1(")
        .replace(/(^|[^\\A-Za-z])theta\b/g, "$1\\theta")
        .replace(/(^|[^\\A-Za-z])pi\b/g, "$1\\pi")
        .trim();
}

function wrapPlainMath(input: string) {
    const mathFragment =
        /(^|[\s(:])((?:d[xy]\/d[xt])|(?:(?:\\theta|[A-Za-z]+(?:\([A-Za-z]\))?)\s*=\s*-?(?:\\?[A-Za-z0-9.()+\-*/^]+)(?:\s*[+\-]\s*\\?[A-Za-z0-9.()+\-*/^]+)*)|(?:[A-Za-z]+\^\{?[-\d]+\}?\/[A-Za-z]+)|(?:[A-Za-z]+\^\{?[-\d]+\}?))(?![A-Za-z])/g;

    return input.replace(mathFragment, (_match, prefix: string, fragment: string) => {
        const trailingPunctuation = fragment.match(/[.,;!?]+$/)?.[0] ?? "";
        const math = trailingPunctuation
            ? fragment.slice(0, -trailingPunctuation.length)
            : fragment;

        return `${prefix}$${normalizePlainMathFragment(math)}$${trailingPunctuation}`;
    });
}

function formatMathText(input: string) {
    const normalized = normalizeMathSyntax(input);
    const delimitedLatex = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$)/g;

    return normalized
        .split(delimitedLatex)
        .map((segment) => {
            if (segment.startsWith("$")) {
                return segment;
            }

            return wrapPlainMath(segment);
        })
        .join("");
}

export default function MathRender({ math }: { math: string | Expression }) {
    try {
        if (typeof math !== "string") {
            math = math.toTeX();
        }
        return (
            <Latex>
                {formatMathText(math)}
            </Latex>
        );
    } catch (e) {
        console.error(e);
        return (
            <div>Sorry, there was an error rendering this math expression!</div>
        );
    }
}
