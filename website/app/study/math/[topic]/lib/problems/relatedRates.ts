import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import {
    DefaultProblemGenerator,
    Problem,
    ProblemCategory,
} from "../question";

import { randomInt, pickRandom } from "../utils";


type LengthUnit = "inches" | "feet" | "meters";

function randomLengthUnit(): LengthUnit {
    return pickRandom(["inches", "feet", "meters"]);
}

function timeUnit(unit: LengthUnit) {
    return unit === "meters" ? "seconds" : "minutes";
}


/* ===================== SPHERE ===================== */
/*
V = (4/3)πr³
dV/dt = 4πr² dr/dt
*/
function sphereProblem(): Problem {
    const unit = randomLengthUnit();
    const tUnit = timeUnit(unit);

    const r = randomInt(6, 20);
    const drdt = randomInt(1, 6);

    const expr = `4*pi*${r}^2*${-drdt}`;

    return {
        question:
            `A spherical object has radius ${r} ${unit} and the radius is decreasing at ` +
            `${drdt} ${unit} per ${tUnit}. At what rate is the volume changing at that instant?`,
        answer:
            `$${nerdamer(expr).toTeX()}$ ${unit}^3/${tUnit}`,
    };
}


/* ===================== CIRCLE ===================== */
/*
A = πr²
dA/dt = 2πr dr/dt
*/
function circleProblem(): Problem {
    const unit = randomLengthUnit();
    const tUnit = timeUnit(unit);

    const r = randomInt(5, 15);
    const drdt = randomInt(1, 5);

    const expr = `2*pi*${r}*${drdt}`;

    return {
        question:
            `The radius of a circle is ${r} ${unit} and is increasing at ` +
            `${drdt} ${unit} per ${tUnit}. How fast is the area changing at that moment?`,
        answer:
            `$${nerdamer(expr).toTeX()}$ ${unit}^2/${tUnit}`,
    };
}


/* ===================== CYLINDER ===================== */
/*
V = πr²h
dV/dt = 2πrh dr/dt
*/
function cylinderProblem(): Problem {
    const unit: LengthUnit = "meters";
    const tUnit = "seconds";

    const r = randomInt(4, 10);
    const h = randomInt(8, 20);
    const drdt = randomInt(1, 4);

    const expr = `2*pi*${r}*${h}*${drdt}`;

    return {
        question:
            `A cylinder has radius ${r} meters and height ${h} meters. ` +
            `The radius is increasing at ${drdt} meters per second. ` +
            `How fast is the volume changing?`,
        answer:
            `$${nerdamer(expr).toTeX()}$ meters^3/second`,
    };
}


/* ===================== LADDER ===================== */
/*
x² + y² = L²
dy/dt = -(x/y) dx/dt
*/
function ladderProblem(): Problem {
    const L = randomInt(15, 30);
    const x = randomInt(6, L - 3);
    const dxdt = randomInt(1, 5);

    const y = Math.sqrt(L * L - x * x);

    const expr = `-(${x}/${y})*${dxdt}`;

    return {
        question:
            `A ${L}-foot ladder is leaning against a wall. The base is being pulled ` +
            `away from the wall at ${dxdt} feet per second. How fast is the top sliding ` +
            `down the wall when the base is ${x} feet from the wall?`,
        answer:
            `$${nerdamer(expr).toTeX()}$ feet/second`,
    };
}


/* ===================== MASTER GENERATOR ===================== */

const RelatedRatesGenerator: DefaultProblemGenerator = {
    generate(): Problem {
        return pickRandom([
            sphereProblem,
            circleProblem,
            cylinderProblem,
            ladderProblem,
        ])();
    },
};


export const RelatedRates: ProblemCategory = {
    name: "Related Rates",
    defaultOptions: [RelatedRatesGenerator],
    options: [],
};
