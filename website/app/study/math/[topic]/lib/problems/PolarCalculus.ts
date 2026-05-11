import nerdamer from "nerdamer-prime"
import "nerdamer-prime/Calculus.js"

import {
Problem,
ProblemCategory,
ProblemGenerator,
} from "../question"

import { pickRandom } from "../utils"

function randomPolar() {
const curves = [
{ r: "a*sin(theta)", dr: "a*cos(theta)" },
{ r: "a*cos(theta)", dr: "-a*sin(theta)" },
{ r: "a*(1+sin(theta))", dr: "a*cos(theta)" },
{ r: "a*(1+cos(theta))", dr: "-a*sin(theta)" },
{ r: "a*sin(2*theta)", dr: "2*a*cos(2*theta)" },
{ r: "a*cos(2*theta)", dr: "-2*a*sin(2*theta)" },
//{ r: "theta", dr: "1" }
]

const curve = pickRandom(curves)

const a = Math.floor(Math.random()*4)+1

const r = curve.r.replaceAll("a",a.toString())
const dr = curve.dr.replaceAll("a",a.toString())

return {r,dr}
}

function polarArea(): Problem {

const curves = [
{ r: "2\\sin\\theta", a: "0", b: "\\pi" },
{ r: "2\\cos\\theta", a: "0", b: "\\pi" },
{ r: "2(1+\\sin\\theta)", a: "0", b: "2\\pi" },
{ r: "2(1+\\cos\\theta)", a: "0", b: "2\\pi" },
{ r: "\\theta", a: "0", b: "2\\pi" }
]

const curve = pickRandom(curves)

return {
question: `Find the area enclosed by $r=${curve.r}$ from $\\theta=${curve.a}$ to $\\theta=${curve.b}$.`,
answer: `$$\\frac{1}{2}\\int_{${curve.a}}^{${curve.b}} (${curve.r})^2 \\, d\\theta$$`
}

}

function polarArcLength(): Problem {

const curves = [
{ r: "2\\sin\\theta", dr: "2\\cos\\theta", a: "0", b: "\\pi" },
{ r: "2\\cos\\theta", dr: "-2\\sin\\theta", a: "0", b: "\\pi" },
{ r: "2(1+\\sin\\theta)", dr: "2\\cos\\theta", a: "0", b: "2\\pi" },
{ r: "2(1+\\cos\\theta)", dr: "-2\\sin\\theta", a: "0", b: "2\\pi" },
{ r: "\\theta", dr: "1", a: "0", b: "2\\pi" }
]

const curve = pickRandom(curves)

return {
question: `Find the arc length of $r=${curve.r}$ from $\\theta=${curve.a}$ to $\\theta=${curve.b}$.`,
answer: `$$\\int_{${curve.a}}^{${curve.b}} \\sqrt{(${curve.r})^2 + (${curve.dr})^2} \\, d\\theta$$`
}
}
const polarGenerators: ProblemGenerator[] = [
{
name: "Polar Area",
generate: polarArea,
},
{
name: "Polar Arc Length",
generate: polarArcLength,
},
]

export const PolarCalculus: ProblemCategory = {
name: "Polar Calculus",
defaultOptions: [],
options: polarGenerators,
}
