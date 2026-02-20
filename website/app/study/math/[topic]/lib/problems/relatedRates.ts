import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import {
    DefaultProblemGenerator,
    Problem,
    ProblemCategory,
} from "../question";

import { randomInt, pickRandom, simplifyAndExpand } from "../utils";


type LengthUnit = "inches" | "feet" | "meters";

function randomLengthUnit(): LengthUnit {
    return pickRandom(["inches", "feet", "meters"]);
}

function timeUnit(unit: LengthUnit) {
    return unit === "meters" ? "seconds" : "minutes";
}




function sphereProblem(): Problem {
    const unit = randomLengthUnit();
    const tUnit = timeUnit(unit);

    const r = randomInt(5, 20);
    const drdt = randomInt(1, 6);

    const V = "(4/3)*pi*r^3";
    const dVdt = nerdamer.diff(V, "t").evaluate({
        r,
        "dr/dt": -drdt,
    });

    return {
        question:
            `A spherical object has radius ${r} ${unit} and the radius is decreasing at ` +
            `${drdt} ${unit}/${tUnit}. At what rate is the volume changing at that instant?`,
        answer:
            `$${simplifyAndExpand(dVdt).toTeX()}\\ \\text{${unit}^3/${tUnit}}$`,
    };
}




function circleProblem(): Problem {
    const unit = randomLengthUnit();
    const tUnit = timeUnit(unit);

    const r = randomInt(4, 15);
    const drdt = randomInt(1, 5);

    const A = "pi*r^2";
    const dAdt = nerdamer.diff(A, "t").evaluate({
        r,
        "dr/dt": drdt,
    });

    return {
        question:
            `The radius of a circle is ${r} ${unit} and is increasing at ` +
            `${drdt} ${unit}/${tUnit}. How fast is the area changing at that moment?`,
        answer:
            `$${simplifyAndExpand(dAdt).toTeX()}\\ \\text{${unit}^2/${tUnit}}$`,
    };
}




function cylinderProblem(): Problem {
    const unit = randomLengthUnit();
    const tUnit = timeUnit(unit);

    const r = randomInt(3, 10);
    const h = randomInt(8, 20);
    const drdt = randomInt(1, 4);

    const V = "pi*r^2*h";
    const dVdt = nerdamer.diff(V, "t").evaluate({
        r,
        h,
        "dr/dt": drdt,
        "dh/dt": 0,
    });

    return {
        question:
            `A cylinder has radius ${r} ${unit} and height ${h} ${unit}. ` +
            `The radius is increasing at ${drdt} ${unit}/${tUnit}. ` +
            `How fast is the volume changing?`,
        answer:
            `$${simplifyAndExpand(dVdt).toTeX()}\\ \\text{${unit}^3/${tUnit}}$`,
    };
}




function ladderProblem(): Problem {
    const unit: LengthUnit = "feet";
    const tUnit = "seconds";

    const L = randomInt(15, 30);
    const x = randomInt(6, L - 3);
    const dxdt = randomInt(1, 5);

    const y = Math.sqrt(L * L - x * x);

    const dydt = nerdamer(
        "-(x/y)*dxdt",
        { x, y, dxdt }
    );

    return {
        question:
            `A ${L}-foot ladder is leaning against a wall. The base is being pulled ` +
            `away from the wall at ${dxdt} feet/second. How fast is the top sliding down ` +
            `the wall when the base is ${x} feet from the wall?`,
        answer:
            `$${simplifyAndExpand(dydt).toTeX()}\\ \\text{feet/second}$`,
    };
}




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
