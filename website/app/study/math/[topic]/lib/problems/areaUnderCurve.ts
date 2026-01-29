import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import { DefaultProblemGenerator, Problem, ProblemCategory } from "../question";

import {
    randomPolynomial,
    pickRandom,
    trigonometricFunctions,
    randomInt,
    simplifyAndExpand,
} from "../utils";

const piBounds = ["pi/6", "pi/4", "pi/2", "pi", "3*pi/2", "2*pi"];

function randomTrigBound() {
    const base = pickRandom(piBounds);

    if (Math.random() < 0.4) {
        return base;
    }

    const k = randomInt(2, 4);
    return `${k}*${base}`;
}

const AreaUnderCurveGenerator: DefaultProblemGenerator = {
    generate(): Problem {
        const isTrig = Math.random() < 0.5;

        let f: string;
        let a: string | number;
        let b: string | number;

        if (isTrig) {
            f = pickRandom(trigonometricFunctions);

            a = randomTrigBound();
            b = randomTrigBound();

            // ensure b > a
            while (nerdamer(b).subtract(a).evaluate().valueOf() <= 0) {
                b = randomTrigBound();
            }
        } else {
            f = randomPolynomial(randomInt(1, 3));

            const low = randomInt(-3, 2);
            const high = randomInt(low + 1, low + 5);

            a = low;
            b = high;
        }

        const integral = nerdamer.integrate(f, "x");

        const upper = integral.evaluate({ x: b });
        const lower = integral.evaluate({ x: a });

        const value = simplifyAndExpand(upper.subtract(lower));

        return {
            question: `Find the area under the curve $${nerdamer(f).toTeX()}$ from $x=${nerdamer(a).toTeX()}$ to $x=${nerdamer(b).toTeX()}$.`,
            answer: `$${value.toTeX()}$`,
        };
    },
};

export const AreaUnderCurve: ProblemCategory = {
    name: "Area Under the Curve",
    defaultOptions: [AreaUnderCurveGenerator],
    options: [],
};
