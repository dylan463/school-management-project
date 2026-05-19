export const BadgeInscription = {
    username: (ins) => {
        return { content: ins.username }
    },
    fullname: (ins) => {
        return { content: ins.full_name }
    },
    status: (ins) => {
        const status = ins.status
        let content = status == "ACTIVE" ? "non délibéré" : status == "PROMOTED" ? "promus" : status == "REPEAT" ? "redouble" : "exclus"
        let color = status == "ACTIVE" ? "yellow" : status == "PROMOTED" ? "green" : "red"
        return { content, color }
    },
    formation: (ins) => {
        const formation = ins.formation
        const content = typeof formation === 'object' ? formation.label || formation.name || formation.code : formation
        return { content, color: 'blue' }
    },
    level: (ins) => {
        const level = ins.level
        const content = typeof level === 'object' ? level.label || level.name || level.code : level
        return { content, color: 'blue' }
    },
    schoolYear: (ins) => {
        const schoolYear = ins.school_year
        const content = typeof schoolYear === 'object' ? schoolYear.label || schoolYear.name || schoolYear.code : schoolYear
        return { content, color: 'blue' }
    },
    finalYear: (ins) => {
        const finalYear = ins.final_year
        const content = finalYear ? "dernière année" : ""
        return { content, color: "green" }
    }
}
export const BadgeYear = {
    label: (year) => {
        return { content: year.label }
    },
    status: (year) => {
        let value = year.status
        let color = 'stale'
        let content = ""
        if (value == "UPCOMING") {
            content = "à venir"
            color = 'yellow'
        } else if (value == "ACTIVE") {
            content = "active"
            color = 'green'
        } else {
            content = "clôt"
            color = 'red'
        }
        return { content, color }
    }
}
export const BadgeUser = {
    fullname: (user) => {
        return { content: user.full_name }
    },
    username: (user) => {
        return { content: user.username }
    },
    email: (user) => {
        return { content: user.email }
    }
}
export const BadgeUE = {
    label: (ue) => {
        return { content: ue.label, color: 'stale' }
    },
    code: (ue) => {
        return { content: ue.code, color: 'yellow' }
    },
    formation: (ue) => {
        const formation = ue.formation
        return { content: formation.code, color: 'blue' }
    },
    semester: (ue) => {
        const semester = ue.semester
        return { content: semester.code, color: 'blue' }
    },
    status: (ue) => {
        return { content: ue.is_active ? "active" : "inactif", color: ue.is_active ? "green" : "red" }
    }
}
export const BadgeCour = {
    code: (cour) => {
        return { content: cour.code }
    },
    hours: (cour) => {
        return { content: cour.volume_hours ? `${cour.volume_hours} h` : '', color: "green" }
    },
    credits: (cour) => {
        return { content: `${cour.credits} cdts`, color: "blue" }
    },
    teacher: (cour) => {
        return { content: cour.teacher ? `enseignant : ${cour.teacher.first_name} ${cour.teacher.last_name}` : '', color: "green" }
    },
    status: (cour) => {
        return { content: cour.is_active ? "actif" : "inactif", color: "green" }
    },
}
export const BadgeExamen = {
    type: (examen) => {
        const map = { EXAM: 'Examen', QUIZ: 'Quiz', TP: 'TP', ORAL: 'Oral' }
        return { content: map[examen.type] || examen.type }
    },
    date: (examen) => {
        return { content: examen.date ? new Date(examen.date).toLocaleDateString('fr-FR') : '', color: 'blue' }
    },
    session: (examen) => {
        return { content: examen.session === 'RETAKE' ? 'Rattrapage' : 'Normale', color: examen.session === 'RETAKE' ? 'red' : 'green' }
    },
    weight: (examen) => {
        return { content: examen.grade_weight ? `poids : ${examen.grade_weight}` : '', color: 'purple' }
    },
    published: (examen) => {
        return { content: examen.is_published ? 'publié' : 'non publié', color: examen.is_published ? 'green' : 'red' }
    },
}
export const BadgeNote = {
    username: (note) => {
        return { content: note.username || '' }
    },
    grade: (note) => {
        return { content: note.grade ? `note : ${note.grade.score}` : 'sans note', color: note.grade ? 'blue' : 'red' }
    },
    debt: (note) => {
        return { content: note.debt_year ? `dette : ${note.debt_year}` : '', color: 'orange' }
    },
}
export const BadgeResultat = {
    full_name: (resultat)=> {
        return {content:resultat.full_name}
    },
    final_score: (resultat)=> {
        return {content:`note final : ${resultat.final_score}`,color:'blue'}
    },
    status: (resultat)=> {
        return {content:resultat.status}
    },
    course_credit: (resultat)=> {
        return {content:resultat.course_credit,color:'yellow'}
    },
    semester: (resultat)=> {
        return {content:resultat.semester,color:'blue'}
    },
    formation: (resultat)=> {
        return {content:resultat.formation,color:'blue'}
    }
}