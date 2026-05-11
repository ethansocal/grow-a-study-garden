import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import { Problem, ProblemCategory, ProblemGenerator } from "../question";

import {
    randomPolynomial,
    pickRandom,
    randomInt,
    simplifyAndExpand,
} from "../utils";

const piBounds = ["pi/6", "pi/4", "pi/2", "pi", "3*pi/2", "2*pi"];
const areaTrigFunctions = ["sin(x)", "cos(x)"];
// Andrew Was here
function randomTrigBounds() {
    const lowIndex = randomInt(0, piBounds.length - 1);
    const highIndex = randomInt(lowIndex + 1, piBounds.length);

    return {
        a: piBounds[lowIndex],
        b: piBounds[highIndex],
    };
}

function polynomialAreaProblem(): Problem {
    const f = randomPolynomial(randomInt(1, 3));

    const low = randomInt(-3, 2);
    const high = randomInt(low + 1, low + 5);

    const integral = nerdamer.integrate(f, "x");
    const upper = integral.evaluate({ x: high });
    const lower = integral.evaluate({ x: low });
    const value = simplifyAndExpand(upper.subtract(lower));

    return {
        question: `Find the area under the curve $${nerdamer(f).toTeX()}$ from $x=${low}$ to $x=${high}$.`,
        answer: `$${value.toTeX()}$`,
    };
}

function trigonometricAreaProblem(): Problem {
    const f = pickRandom(areaTrigFunctions);
    const { a, b } = randomTrigBounds();

    const integral = nerdamer.integrate(f, "x");
    const upper = integral.evaluate({ x: b });
    const lower = integral.evaluate({ x: a });
    const value = simplifyAndExpand(upper.subtract(lower));

    return {
        question: `Find the area under the curve $${nerdamer(f).toTeX()}$ from $x=${nerdamer(a).toTeX()}$ to $x=${nerdamer(b).toTeX()}$.`,
        answer: `$${value.toTeX()}$`,
    };
}

const areaUnderCurveGenerators: ProblemGenerator[] = [
{
    name: "Polynomial Area",
    generate: polynomialAreaProblem,
},
{
    name: "Trigonometric Area",
    generate: trigonometricAreaProblem,
},
];

export const AreaUnderCurve: ProblemCategory = {
    name: "Area Under the Curve",
    defaultOptions: [],
    options: areaUnderCurveGenerators,
};
