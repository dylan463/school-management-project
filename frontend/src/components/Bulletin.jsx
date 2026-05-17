import { useMemo } from "react";

const buldMatrix = (results) => {
    const coursUnits = []
    const map = {};
    let totalScore = 0;
    let totalCredit = 0;
    results.forEach((result) => {
        const course_unit = result.course_module.course_unit.label;
        const course_module = result.course_module.label;
        const score = result.final_score;
        const credit = result.course_module.credit;
        const status = result.status;
        if (!map[course_unit]) {
            map[course_unit] = {};
            coursUnits.push(course_unit);
        }
        map[course_unit][course_module] = { score, credit, status };
        let unit = coursUnits.find((unit) => unit.label === course_unit);
        if (!unit) {
            unit = { label: course_unit, modules: [], total_score: 0, total_credit: 0, validated: true };
            coursUnits.push(unit);
        }
        totalScore += score * credit;
        totalCredit += credit;
        unit.total_score += score * credit;
        unit.total_credit += credit;
        if (status == "NOT_VALIDATED") unit.validated = false;
        if (!unit.modules.includes(course_module)) unit.modules.push(course_module);
    });
    return { coursUnits, map, totalScore, totalCredit, average: totalCredit > 0 ? totalScore / totalCredit : 0 }
}

export default function Bulletin({ results, formation, level, school_year, semester, student }) {
    const { coursUnits, map, totalScore, totalCredit, average } = useMemo(() => buldMatrix(results), [results]);
    return (
        <div className="mt-5 w-[210mm] h-[297mm] border-2 border-black border-solid overflow-auto">
            <div className="flex flex-col justify-between w-full h-full px-20 py-20">
                <div>
                    <p>Formation: {formation}</p>
                    <p>Niveau: {level}</p>
                    <p>Année scolaire: {school_year}</p>
                    <p>Semestre: {semester}</p>
                    <p>Nom et prénoms : {student.full_name}</p>
                    <p>Matricule : {student.username}</p>
                </div>
                <div className="gap-y-5 mt-3 mb-5">
                    {coursUnits.length == 0 ? <p>Aucun résultat</p> : (
                        coursUnits.map((unit) => (
                            <table key={unit.label} className="w-full border-collapse border border-black text-xs mb-3">
                                <thead>
                                    <tr>
                                        <th className="border border-black px-2 py-1 bg-gray-100" colSpan={8}>{unit.label}</th>
                                    </tr>
                                    <tr>
                                        <th className="border border-black px-2 py-1 bg-gray-50">Elements Constitutifs</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50">crédit</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50">note</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50">note avec crédit</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50" rowSpan={1 + unit.modules.length}>crédit total : {unit.total_credit}</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50" rowSpan={1 + unit.modules.length}>note totale : {unit.total_score}</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50" rowSpan={1 + unit.modules.length}>moyenne : {(unit.total_credit ? unit.total_score / unit.total_credit : 0).toFixed(2)}</th>
                                        <th className="border border-black px-2 py-1 bg-gray-50" rowSpan={1 + unit.modules.length}>{unit.validated ? "Validé" : "Non validé"}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        unit.modules.map((module) => (
                                            <tr key={module}>
                                                <td className="border border-black px-2 py-1">{module}</td>
                                                <td className="border border-black px-2 py-1">{map[unit.label][module].credit}</td>
                                                <td className="border border-black px-2 py-1">{map[unit.label][module].score}</td>
                                                <td className="border border-black px-2 py-1">{map[unit.label][module].score * map[unit.label][module].credit}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>

                        ))
                    )}
                </div>
                <div>
                    <table className="w-full border-collapse border border-black text-xs">
                        <thead>
                            <tr>
                                <th className="border border-black px-2 py-1 bg-gray-100" colSpan={2}>Statistiques finales</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border border-black px-2 py-1">crédit total</td>
                                <td className="border border-black px-2 py-1">{totalCredit}</td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1">note totale avec crédits</td>
                                <td className="border border-black px-2 py-1">{totalScore}</td>
                            </tr>
                            <tr>
                                <td className="border border-black px-2 py-1">moyenne générale</td>
                                <td className="border border-black px-2 py-1">{average.toFixed(2)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}