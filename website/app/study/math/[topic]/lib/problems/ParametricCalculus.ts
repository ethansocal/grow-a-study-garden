import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import {
DefaultProblemGenerator,
Problem,
ProblemCategory,
} from "../question";

import { randomInt, pickRandom } from "../utils";

function velocityProblem(): Problem {
const a = randomInt(1,4);
const b = randomInt(1,4);
const t = randomInt(1,3);

const vx = a;
const vy = 2*b*t;

return {
question: `A particle moves with parametric equations x(t) = ${a}t and y(t) = ${b}t^2. Find the velocity vector at t = ${t}.`,
answer: `\\langle ${vx}, ${vy} \\rangle`,
};
}

function speedProblem(): Problem {
const a = randomInt(1,4);
const b = randomInt(1,4);
const t = randomInt(1,3);

const expr = `sqrt(${a}^2 + (${2*b*t})^2)`;

return {
question: `A particle moves with x(t)=${a}t and y(t)=${b}t^2. Find the speed at t=${t}.`,
answer: `$${nerdamer(expr).toTeX()}$`,
};
}

function accelerationProblem(): Problem {
const a = randomInt(1,4);

return {
question: `A particle moves with x(t)=t^2 and y(t)=${a}t^3. Find the acceleration vector.`,
answer: `\\langle 2, ${6*a}t \\rangle`,
};
}

function slopeProblem(): Problem {
const a = randomInt(1,4);
const b = randomInt(1,4);
const t = randomInt(1,3);

const expr = `(${2*b*t})/${a}`;

return {
question: `Find dy/dx for x(t)=${a}t and y(t)=${b}t^2 at t=${t}.`,
answer: `$${nerdamer(expr).toTeX()}$`,
};
}

function tangentProblem(): Problem {
const a = randomInt(1,3);
const b = randomInt(1,3);
const t = randomInt(1,3);

const x = a*t;
const y = b*t*t;
const slope = (2*b*t)/a;

return {
question: `Find the equation of the tangent line for x(t)=${a}t and y(t)=${b}t^2 at t=${t}.`,
answer: `y - ${y} = ${slope}(x - ${x})`,
};
}

function arcLengthProblem(): Problem {
const a = randomInt(1,3);
const b = randomInt(1,3);
const upper = randomInt(2,4);

const integrand = `sqrt(${a}^2 + (${2*b}*t)^2)`;

const exact = nerdamer(`integrate(${integrand}, t, 0, ${upper})`);
const decimal = exact.evaluate().text("decimals");

return {
question: `Find the arc length of the curve x(t)=${a}t and y(t)=${b}t^2 from t=0 to t=${upper}.`,
answer: `∫₀^${upper} $${nerdamer(integrand).toTeX()}$ dt = $${exact.toTeX()}$ ≈ ${decimal}`,
};
}

function parametricArea(): Problem {
const a = randomInt(1,3);
const b = randomInt(1,3);
const upper = randomInt(2,4);

const integrand = `${b}*t^2*${a}`;

const exact = nerdamer(`integrate(${integrand}, t, 0, ${upper})`);
const decimal = exact.evaluate().text("decimals");

return {
question: `Find the area under the parametric curve x=${a}t, y=${b}t^2 from t=0 to t=${upper}.`,
answer: `∫₀^${upper} $${nerdamer(integrand).toTeX()}$ dt = $${exact.toTeX()}$ ≈ ${decimal}`,
};
}

const ParametricGenerator: DefaultProblemGenerator = {
generate(): Problem {
return pickRandom([
velocityProblem,
speedProblem,
accelerationProblem,
slopeProblem,
tangentProblem,
arcLengthProblem,
parametricArea
])();
},
};

export const ParametricCalculus: ProblemCategory = {
name: "Parametric Calculus",
defaultOptions: [ParametricGenerator],
options: [],
};