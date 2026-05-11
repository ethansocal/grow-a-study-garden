import { AreaUnderCurve } from "./problems/areaUnderCurve";
import { Derivative } from "./problems/derivative";
import { EOTL } from "./problems/eotl";
import { Integral } from "./problems/integral";
import {RelatedRates} from "./problems/relatedRates";
import {ParametricCalculus} from "./problems/ParametricCalculus"
import {PolarCalculus} from "./problems/PolarCalculus"
import { pickRandom } from "./utils";

export interface Problem {
    question: string;
    answer: string; 
}

export interface DefaultProblemGenerator {
    generate(): Problem;
    name?: string;
}

export interface ProblemGenerator {
    generate(): Problem;
    name: string;
}

export interface ProblemCategory {
    name: string;
    options: ProblemGenerator[];
    defaultOptions: DefaultProblemGenerator[];
}

export interface CategorizedProblem {
    problem: Problem;
    categoryName: string;
    generatorName?: string;
}

export const problemCategories: ProblemCategory[] = [
    Derivative,
    Integral,
    EOTL,
    AreaUnderCurve,
    RelatedRates,
    PolarCalculus,
    ParametricCalculus,
];

export type EnabledProblems = {
    [key: string]: { [key2: string]: boolean } | undefined;
};

function pickProblemCategory(categoryNames?: string[]): ProblemCategory {
    const enabledCategories = categoryNames?.length
        ? problemCategories.filter((category) =>
              categoryNames.includes(category.name),
          )
        : problemCategories;
    return pickRandom(
        enabledCategories.length ? enabledCategories : problemCategories,
    );
}

function pickProblemGenerator(category: ProblemCategory) {
    return pickRandom([
        ...category.options,
        ...category.defaultOptions,
    ]);
}

function getProblemGenerators(category: ProblemCategory) {
    return [
        ...category.options,
        ...category.defaultOptions,
    ];
}

export function generateProblem(categoryNames?: string[]): Problem {
    const category = pickProblemCategory(categoryNames);
    return pickProblemGenerator(category).generate();
}

export function generateCategorizedProblem(
    categoryNames?: string[],
): CategorizedProblem {
    const category = pickProblemCategory(categoryNames);
    const generator = pickProblemGenerator(category);
    return {
        categoryName: category.name,
        generatorName: "name" in generator ? generator.name : undefined,
        problem: generator.generate(),
    };
}

export function generateProblemFromGenerator(
    categoryName: string,
    generatorName?: string,
): Problem {
    const category =
        problemCategories.find((option) => option.name === categoryName) ??
        pickProblemCategory([categoryName]);
    const namedGenerator = generatorName
        ? getProblemGenerators(category).find(
              (generator) => "name" in generator && generator.name === generatorName,
          )
        : undefined;

    return (namedGenerator ?? pickProblemGenerator(category)).generate();
}

export function generateProblems(
    amount: number,
    enabledProblems: EnabledProblems,
): Problem[] {
    return Array.from({ length: amount }, () => {
        const category = pickRandom(
            problemCategories.filter(
                (option) => enabledProblems[option.name]?.["all"] ?? true,
            ),
        );
        return pickRandom([
            ...category.options,
            ...category.defaultOptions,
        ]).generate();
    });
}
