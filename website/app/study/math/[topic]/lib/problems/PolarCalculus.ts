import nerdamer from "nerdamer-prime";
import "nerdamer-prime/Calculus.js";

import {
DefaultProblemGenerator,
Problem,
ProblemCategory,
} from "../question";

import { randomInt, pickRandom } from "../utils";

function polarArea(): Problem {
const a = randomInt(1,4);
const upper = pickRandom(["pi/2","pi","2*pi"]);

const integrand = `(${a}*sin(theta))^2`;

const exact = nerdamer(`1/2*integrate(${integrand}, theta, 0, ${upper})`);
const decimal = exact.evaluate().text("decimals");

return {
question: `Find the area enclosed by r=${a}sin(θ) from θ=0 to θ=${upper}.`,
answer: `1/2 ∫₀^${upper} $${nerdamer(integrand).toTeX()}$ dθ = $${exact.toTeX()}$ ≈ ${decimal}`,
};
}

function polarArcLength(): Problem {
const a = randomInt(1,3);
const upper = pickRandom(["pi/2","pi"]);

const expr = `sqrt((${a}*sin(theta))^2 + (${a}*cos(theta))^2)`;

const exact = nerdamer(`integrate(${expr}, theta, 0, ${upper})`);
const decimal = exact.evaluate().text("decimals");

return {
question: `Find the arc length of r=${a}sin(θ) from θ=0 to θ=${upper}.`,
answer: `∫₀^${upper} $${nerdamer(expr).toTeX()}$ dθ = $${exact.toTeX()}$ ≈ ${decimal}`,
};
}

function polarBetween(): Problem {
const a = randomInt(2,5);

const exact = nerdamer(`1/2*integrate(${a}^2 - (${a}*sin(theta))^2, theta, 0, pi)`);
const decimal = exact.evaluate().text("decimals");

return {
question: `Find the area between r=${a} and r=${a}sin(θ) for 0 ≤ θ ≤ π.`,
answer: `1/2 ∫₀^π (${a}² - ${a}² sin²θ) dθ = $${exact.toTeX()}$ ≈ ${decimal}`,
};
}

const PolarGenerator: DefaultProblemGenerator = {
generate(): Problem {
return pickRandom([
polarArea,
polarArcLength,
polarBetween
])();
},
};

export const PolarCalculus: ProblemCategory = {
name: "Polar Calculus",
defaultOptions: [PolarGenerator],
options: [],
};